import axios from 'axios';

export const getArticles = async () => {
	let data = await axios.get('https://nba-stories.onrender.com/articles?limit=10');
	return data.data;
}