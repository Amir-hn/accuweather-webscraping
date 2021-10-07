
import cheerio from 'cheerio';
import axios from 'axios'



const getReddit = async (link) => {
	const response = await axios(`https://scrape.abstractapi.com/v1/?api_key=b0bc33c6e2af4adca0551ec2cdcfb1de&url=${link}`)
  
	return response.data;
};



const link = 'https://www.accuweather.com/en/gb/london/ec4a-2/august-weather/328328'
getReddit(link)
.then((a) => console.log(a));