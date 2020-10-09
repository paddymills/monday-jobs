
const PROD_JOB = /(\w)-(\d{7})\w-(\d{2})/
const EST_JOB = /E-(\d{2})-(\d{4})\w-(\d{2})/

const COST_CENTERS = {
  "2005": "WB",
  "2006": "NB",
  "2007": "SB",
  "2030": "MBN",
  "2031": "MBS",
};

export default class FileParser {

  init(state) {
    this.cfg = state;
  }

  parseFile(file) {
    return file.text().then(res => this.parseText(res));
  }

  parseText(fileText, state) {
    // TODO: filter out items not in this.state.jobs
    var jobs = {};
    jobs.updateJob = (job, prop, val, overwrite = false) => {
      if (!jobs.hasOwnProperty(job)) {
        jobs[job] = {};
      }

      if (val === "") {
        val = null;
      }

      if (jobs[job].hasOwnProperty(prop) && !overwrite) {

        jobs[job][prop] += "," + val;

      } else {

        jobs[job][prop] = val;

      }
    };

    var result = [];

    fileText
      .split("\r\n")
      .map(x => x.split(","))
      .map(formatJob)
      .filter(x => x[1])
      .forEach(line => {
        let col = line[0];
        let job = line[1];

        result.push(job);
        switch (col) {
          case "Dates":
            jobs.updateJob(job, this.cfg.earlyStartColumn, line[2]);
            jobs.updateJob(job, this.cfg.mainStartColumn, line[3]);
            break;
          case "PM":
            jobs.updateJob(job, this.cfg.pmColumn, line[2], true);
            break;
          case "Products":
            jobs.updateJob(job, this.cfg.productsColumn, line[2]);
            break;
          case "Bays":
            if (COST_CENTERS.hasOwnProperty(line[2])) {
              jobs.updateJob(job, this.cfg.baysColumn, COST_CENTERS[line[2]]);
            }
            break;
          default:
            console.log("Type not matched: ", line.toString());
            break;
        }
      });

    return result
      .map(key => {
        console.log(key + ": " + JSON.stringify(jobs[key]));

        return [key, jobs[key]];
      });
  }
}

function formatJob(line) {
  line[1] = parseJob(line[1]);

  return line
}

function parseJob(job) {
  let match = PROD_JOB.exec(job);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  match = EST_JOB.exec(job);
  if (match) {
    return `D-${match[1]}0${match[2]}-${match[3]}`;
  }

  return job;
}
