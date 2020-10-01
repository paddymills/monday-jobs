

function fileHandler(fileText) {
  // TODO: filter out items not in this.state.jobs

  fileText
    .split("\r\n")
    .map(line => line.split(","))
    .filter(x => x[0])
    .forEach(line => {
      console.log([
        line[0],
        {
          [this.state.earlyStartColumn]: line[1],
          [this.state.mainStartColumn]: line[2],
          [this.state.pmColumn]: line[3],
          [this.state.baysColumn]: line[4],
          [this.state.productsColumn]: line[5],
        }
      ]);
    });
}

export function fileParser(file) {
  file.text().then(res => fileHandler(res));
};