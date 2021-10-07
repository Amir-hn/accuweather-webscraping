import prompt from "prompt-sync";
import fs from "fs";
import path from "path";
/**
 *  this class commiunicate with i/o for read or save files
 *
 * @class IO
 */
class IO {
  /**
   * get link from user input
   *
   * @static
   * @return String link
   * @memberof IO
   */
  static getLink = () => {
    const p = prompt({ sigint: true });
    return p("Please enter your link:");
  };

  /**
   * save file to json file in data folder
   * @param String fileName
   * @param String data
   */
  static saveJsonFile = (fileName, data) => {
    const filePath = path.join(path.dirname("."), `/data/${fileName}.json`);
    fs.writeFile(filePath, JSON.stringify(data), (err) => {
      if (err) {
        console.error(`could\'nt save file ${fileName}`);
        return console.error(err);
      }

      console.log(`json data saved succesfully in ${filePath}`);
    });
  };
}

export default IO;
