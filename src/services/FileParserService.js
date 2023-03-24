
import mondayService from "./MondayService.js";

const PROD_JOB = /(\w)-(\d{7}\w)-(\d{2})/;
const EST_JOB = /E-(\d{2})-(\d{4}\w)-(\d{2})/;

const JOB_INDEX = 1;

const COST_CENTERS = {
  "2005": "WB",
  "2006": "NB",
  "2007": "SB",
  "2030": "MBN",
  "2031": "MBS",
};

export default class FileParser {

  constructor() {
    this.jobs = { jobNumbers: [] };

    // update job method
    this.jobs.updateJob = (job, prop, val) => {
      if (!this.jobs.hasOwnProperty(job)) {
        return;
      }

      if (val === "" || val === null) {
        return;
      }

      if (this.jobs[job].hasOwnProperty(prop)) {
        val = this.jobs[job][prop] + "," + val;
      }

      if (this.jobs.jobNumbers.indexOf(job) === -1) {
        this.jobs.jobNumbers.push(job);
      }

      this.jobs[job][prop] = val;
    };

    // job exists
    this.jobs.exists = (job) => {
      if (this.jobs.hasOwnProperty(job)) {
        return true;
      }

      return false;
    };

    return this;
  }

  initConfig(state) {
    this.cfg = state;

    return this;
  }

  async initJobs() {
    return mondayService
      .getJobs(this.cfg.boardId)
      .then(res => {
        Object.assign(this.jobs, res);

        return this;
      });
  }

  async parseFile(file) {
    const text = await file.text();

    text
      .split("\r\n")          // split text into lines
      .map(parseLine)         // split lines into array and parse job
      .filter(x => this.jobs.exists(x[JOB_INDEX]))
      .forEach(line => {
        let job = line[JOB_INDEX];

        const type = line[0];
        if (type === "Dates") {
          this.jobs.updateJob(job, this.cfg.earlyStartColumn, formatDate(line[2]));
          this.jobs.updateJob(job, this.cfg.mainStartColumn, formatDate(line[3]));
        }

        else if (type === "PM") {
          this.jobs.updateJob(job, this.cfg.pmColumn, line[2]);
        }

        else if (type === "Products") {
          this.jobs.updateJob(job, this.cfg.productsColumn, line[2]);
        }

        else if (type === "Bays") {
          if (COST_CENTERS.hasOwnProperty(line[2])) {
            this.jobs.updateJob(job, this.cfg.baysColumn, COST_CENTERS[line[2]]);
          }
        }

        else {
          console.log("Type not matched: ", line);
        }

      });

    return this.jobs.jobNumbers
      .map(key => {
        return { job: key, vals: this.jobs[key] };
      });
  }
}

function parseLine(line) {
  const arr = line.split(",");

  arr[JOB_INDEX] = parseJob(arr[JOB_INDEX]);

  return arr;
}

function parseJob(job) {
  let match = PROD_JOB.exec(job);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  match = EST_JOB.exec(job);
  if (match) {
    return `D-1${match[1]}${match[2]}-${match[3]}`;
  }

  return job;
}

function formatDate(date) {
  if (date === "") {
    return null;
  }

  return new Date(date).toISOString().substring(0, 10);
}
