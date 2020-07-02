import monday

from traceback import print_exc
from msvcrt import getch

try:
    monday.main()

    print("Processing Complete")

except:
    print_exc()

finally:
    print("Press any key to exit")
    _ = getch()
