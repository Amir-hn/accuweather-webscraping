import IO from "./classes/IO.js";
import Crawller from "./classes/Crawller.js";

const link = IO.getLink();
const crawller = new Crawller();

(async () => {
  const dailyLink = await crawller.scrapMonthPage(link);
  crawller.scrapDailyPage(dailyLink);
  crawller.extractMonthData();
})();
