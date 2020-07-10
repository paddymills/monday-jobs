import monday

from traceback import print_exc
from msvcrt import getch
from configparser import ConfigParser

config = ConfigParser()
config.read('config.ini')

monday.set_token(config['DEFAULT']['token'])
monday.set_xl_file(config['DEFAULT']['xl_file'])

try:
    monday.main()

    print("Processing Complete")

except:
    print_exc()

finally:
    print("Press any key to exit")
    _ = getch()
