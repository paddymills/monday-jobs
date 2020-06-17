
import logging
import sys

from os import getenv
from os.path import join, dirname, realpath
from re import compile as regex
from argparse import ArgumentParser
from datetime import datetime
from moncli import MondayClient, create_column_value, ColumnType

from prodctrlcore.hssformats import schedule
from prodctrlcore.utils import CountingIter

logger = logging.getLogger(__name__)

FROZEN = hasattr(sys, 'frozen')  # frozen
if FROZEN:
    BASE_DIR = dirname(sys.executable)
else:  # unfrozen
    BASE_DIR = dirname(realpath(__file__))

DATA_FILE = join(BASE_DIR, "data", "Job Ship Dates.xlsx")

TOKEN = getenv('MONDAY_TOKEN')
SKIP_GROUPS = ['Jobs Completed Through PC']
JOB_REGEX = regex("([A-Z])-([0-9]{7})[A-Z]?-([0-9]{1,2})")

# column mapping to monday
# column: (id, type)
col_map = dict(
    pm=('text', ColumnType.text),
    product=('text6', ColumnType.text),
    bay=('text2', ColumnType.text),
    early_start=('early_start', ColumnType.date),
    main_start=('date', ColumnType.date),
)


def init_argparser():
    parser = ArgumentParser()

    parser.add_argument('-d', '--dev', action='store_true',
                        help='Execute on development instance')
    parser.add_argument('-r', '--restore', action='store_true',
                        help='Execute restore mode')

    return parser.parse_args()


def init_logger():
    timestamp = datetime.now().date().isoformat()
    LOG_FILE = join(BASE_DIR, "logs", '{}.log'.format(timestamp))
    logging.basicConfig(filename=LOG_FILE, level=logging.INFO)


def main():
    init_logger()
    args = init_argparser()

    if args.restore:
        # restore updates from monday?
        updates = dict()
    else:
        updates = get_update_data()

    if args.dev:
        process_updates(updates, board_name='Development')
    else:
        process_updates(updates)


def get_update_data():
    jobs = schedule.get_job_ship_dates(DATA_FILE)

    keys = list(jobs.keys())
    for key in keys:
        without_struct = '-'.join(JOB_REGEX.match(key).groups())
        jobs[without_struct] = jobs[key]
        del jobs[key]

    return jobs


def process_updates(jobs, board_name='Jobs'):
    client = MondayClient('pimiller@high.net', TOKEN, TOKEN)
    board = client.get_board(name=board_name)

    count = 0
    for group in board.get_groups():
        if group.title in SKIP_GROUPS:
            continue

        for item in group.get_items():
            if item.name in jobs:
                print('\r[{}] Updating: {}'.format(count, item.name), end='')

                update_vals = list()
                for k, v in jobs[item.name].items():
                    col_id, col_type = col_map[k]

                    if v is None:
                        kwargs = {}
                    elif col_type is ColumnType.date:
                        kwargs = {'date': v.date().isoformat()}
                    else:
                        kwargs = {'value': v}

                    col = create_column_value(col_id, col_type, **kwargs)

                    update_vals.append(col)

                item.change_multiple_column_values(column_values=update_vals)
                logger.info("Updating {}: {}".format(
                    item.name, str(update_vals)))
                count += 1
            else:
                logger.info("Not in active jobs: {}".format(item.name))


if __name__ == "__main__":
    main()
