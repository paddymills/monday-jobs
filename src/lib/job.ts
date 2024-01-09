
const COST_CENTERS: Record<number, string> = {
	2005: 'WB',
	2006: 'NB',
	2007: 'SB',
	2030: 'MBN',
	2031: 'MBS'
};

type JsonFormat = {
    earlyStart: string,
    mainStart: string,
    pm: string,
    products: string[],
    bays: number[]
}

class Job {
	name: string = "";
	pm: string = "";
	products: string[] = [];
	bays: number[] = [];
	earlyStart: Date | null = new Date();
	mainStart:  Date | null = new Date();

    constructor(job: string, json: JsonFormat) {
        this.name = job;
        Object.assign(this, json);

        const handleDate = (dt: string) => dt === null ? null : new Date(dt);

        this.earlyStart = handleDate(json.earlyStart);
        this.mainStart  = handleDate(json.mainStart);
    }

    getProducts(): string {
        return this.products.join(',');
    }

    getBays(): string {
        return this.bays
            .filter((cc) => Object.hasOwn(COST_CENTERS, cc))
            .map((cc) => COST_CENTERS[cc])
            .join(',');
    }
}

export { Job, type JsonFormat };
