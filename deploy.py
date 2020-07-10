
from PyInstaller.__main__ import run as pyinstall
from configparser import ConfigParser

from os import getenv, mkdir
from shutil import copyfile


def main():
    pyinstall(["entrypoint.spec"])

    generate_config()
    copy_dist('config.ini')
    copy_dist('__job_ship_dates.xlsx')
    mkdir('dist\\logs')


def generate_config():
    config = ConfigParser()
    config['DEFAULT'] = dict(
        token=getenv('MONDAY_TOKEN'),
        xl_file='__job_ship_dates.xlsx',
    )

    with open('config.ini', 'w') as cfg:
        config.write(cfg)


def copy_dist(filename):
    copyfile(filename, 'dist\\{}'.format(filename))


if __name__ == "__main__":
    main()
