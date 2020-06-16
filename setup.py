from setuptools import setup, find_packages

setup(
    name='monday-jobs',
    version=1.0,
    description="Monday.com Jobs board automation script",
    install_requires=[
        "moncli>=0.1.6",
        "prodctrlcore @ git+https://github.com/paddymills/prodctrlcore"
    ]
)
