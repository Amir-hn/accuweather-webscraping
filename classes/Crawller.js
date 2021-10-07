import axios from "axios";
import cheerio from "cheerio";
import IO from "./IO.js";

/**
 * Crawller class for scrap data
 */
class Crawller {
  // use it for save daily details
  _dailyDetails = [];
  // use it for current daily link is done
  _dailyIndex = 0;

  /**
   *
   * use this method for get page html content from abstract api
   * There are always easier ways XD
   * @param {String} link
   * @memberof Crawller
   */
  _getPage = async (link) => {
    const { data } = await axios(
      `https://scrape.abstractapi.com/v1/?api_key=b377dcaa4ca84be1bb9960a7857c2d88&url=${link}`
    );

    const html = cheerio.load(data);

    return html;
  };

  /**
   *  extract mounth calender and daily link and return daily link
   *
   * @param {String} link
   * @returns {String} dailyLink
   * @memberof Crawller
   */
  scrapMonthPage = async (link) => {
    try {
      console.log("start crawling");
      const $ = await this._getPage(link);

      console.log("extract month page");
      this._monthCalenderData = $(".monthly-calendar").html();

      const dailyLink = $("a.monthly-cta").attr("href");

      console.log("get month calender and daily link");
      return dailyLink;
    } catch (error) {
      console.error("error");
      throw error;
    }
  };

  /**
   * extract mounth calender data and save it in json file
   *
   * @memberof Crawller
   */
  extractMonthData = () => {
    console.log("start extract calender data");
    const $ = cheerio.load(this._monthCalenderData);

    const data = {};

    // each cell in calender
    $(".monthly-daypanel").each((_, element) => {
      //which day of month
      const date = $(element).find(".date").text().replaceAll("\n", "").trim();

      // high tempureture in day
      const highTemp = $(element)
        .find(".temp .high")
        .text()
        .replaceAll("\n", "")
        .trim();

      // low tempureture in day
      const lowTemp = $(element)
        .find(".temp .low")
        .text()
        .replaceAll("\n", "")
        .trim();

      data[date] = {
        high: highTemp,
        low: lowTemp,
      };
    });

    console.log("extract calender data done!");
    IO.saveJsonFile("monthData", data); // save data in monthData.json file in data folder
  };

  /**
   * get each daily link and call scrapDayDetails for scrap day details
   *
   * @param {String} link
   * @memberof Crawller
   */
  scrapDailyPage = async (link) => {
    console.log("start scrap daily page");
    const $ = await this._getPage(`https://www.accuweather.com${link}`);
    console.log("fetch daily page done");

    this._countDeaily = $(".daily-wrapper").length;

    let i = 1;
    //get every day links
    $(".daily-wrapper").each(async (_, element) => {
      //Only 1 request can be sent per second with this api and we need a break between requests
      const link = $(element).find("a.daily-forecast-card").attr("href");
      const timer = i++ * 2500;
      setTimeout(() => {
        this._scrapDayDetails(link);
      }, timer);
    });
  };

  /**
   * scrap a daily page details and call _scrapDailyDone
   *
   * @param {String} link
   * @memberof Crawller
   */
  _scrapDayDetails = async (link) => {
    console.log(`start scrap ${link}`);
    this._getPage(`https://www.accuweather.com${link}`)
      .then(async ($) => {
        const pageDetails = {};

        //get date String
        pageDetails["date"] = $(".page-column-1 .subnav-pagination div")
          .text()
          .replaceAll("\n", "")
          .trim();

        //wait for scraping done
        await Promise.all(
          $(".half-day-card").each(async (_, element) => {
            //get title of day or night
            const title = $(element)
              .find(".title")
              .text()
              .replaceAll("\n", "")
              .trim();

            //high temp in day and low temp in night
            const temp = $(element)
              .find(".temperature")
              .text()
              .replaceAll("\n", "")
              .trim();

            const details = {};
            //details of each row like wind speed
            await Promise.all(
              $(element)
                .find(".panels .left .panel-item")
                .each((_, el) => {
                  const key = $(el)
                    .first()
                    .contents()
                    .filter(function () {
                      return this.type === "text";
                    })
                    .text()
                    .replaceAll("\n", "")
                    .trim();
                  const value = $(el)
                    .find(".value")
                    .text()
                    .replaceAll("\n", "")
                    .trim();
                  details[key] = value;
                })
            );

            await Promise.all(
              $(element)
                .find(".panels .right .panel-item")
                .each((_, el) => {
                  const key = $(el)
                    .first()
                    .contents()
                    .filter(function () {
                      return this.type === "text";
                    })
                    .text()
                    .replaceAll("\n", "")
                    .trim();
                  const value = $(el)
                    .find(".value")
                    .text()
                    .replaceAll("\n", "")
                    .trim();
                  details[key] = value;
                })
            );

            pageDetails[title] = {
              temp: temp,
              details: details,
            };
          })
        );

        return pageDetails;
      })
      .then((details) => {
        this._scrapDailyDone(details);
      });
  };

  /**
   * save data in _dailyDetails and if all daily links scraping done save it in dailyDate json file in data folder
   *
   * @param {*} details
   * @memberof Crawller
   */
  _scrapDailyDone = (details) => {
    this._dailyDetails.push(details);
    console.log(`scrap day ${this._dailyIndex++ + 1} done`);

    if (this._dailyIndex === this._countDeaily) {
      IO.saveJsonFile("dailyData", this._dailyDetails);
    }
  };
}

export default Crawller;
