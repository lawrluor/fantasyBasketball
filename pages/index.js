import React from 'react';
import Head from 'next/head';
import { getArticles } from '../nbaApi';

import styles from '../styles/Home.module.css';

const KEYS = ['pts', 'reb', 'ast', 'stl', 'blk', 'turnover'];
const SECONDARY_KEYS = ['min', 'games_played', 'fgm', 'fga', 'fg_pct', 'fg3m', 'fg3a', 'fg3_pct', 'ftm', 'fta', 'ft_pct','oreb', 'dreb', 'pf'];

export default function Start() {
  const [results, setResults] = React.useState([]);
  const [articles, setArticles] = React.useState([]);

  // {"data":[
  //  {"games_played":30,"player_id":32,"season":2018,"min":"16:46","fgm":2.0,"fga":4.73,"fg3m":0.43,"fg3a":1.73,"ftm":0.6,"fta":0.93,"oreb":0.53,"dreb":2.23,"reb":2.77,"ast":0.57,"stl":0.6,"blk":0.47,"turnover":0.47,"pf":0.97,"pts":5.03,"fg_pct":0.423,"fg3_pct":0.25,"ft_pct":0.643},
  //  {"games_played":34,"player_id":34,"season":2018,"min":"19:19","fgm":2.41,"fga":6.76,"fg3m":0.85,"fg3a":2.88,"ftm":0.47,"fta":0.82,"oreb":0.35,"dreb":1.5,"reb":1.85,"ast":3.5,"stl":0.53,"blk":0.06,"turnover":0.94,"pf":1.65,"pts":6.15,"fg_pct":0.357,"fg3_pct":0.296,"ft_pct":0.571}
  // ]}
  const getSeasonData = async (players, year) => {
    const url = `https://www.balldontlie.io/api/v1/season_averages?season=${year}`;
    const playerIdsString = players.map(player => `&player_ids[]=${player.id}`).join("");
    // alert(url + playerIdsString);
    const response = await fetch(url + playerIdsString);
    let data = await response.json();
    data = data.data;
    return data;
  }

  const getPlayers = async (query="") => {
    const url = 'https://www.balldontlie.io/api/v1/players?search=';
    const response = await fetch(url + query);
    let players = await response.json();
    players = players.data;

    let seasonData = await getSeasonData(players, "2022");

    // Match the player to their season data using player_id and id
    let activePlayers = [];  // players that have season data

    players.forEach(player => {
      let season_data = {}
      for (let playerSeason of seasonData) {
        if (player.id === playerSeason.player_id) {
          season_data = playerSeason;
        }
      }

      // If no season data, don't return data for that player
      if (season_data !== {} && season_data['games_played'] > 0) {
        activePlayers.push({
          id: player.id,
          first_name: player.first_name,
          last_name: player.last_name,
          height_feet: player.height_feet,
          height_inches: player.height_inches,
          position: player.position,
          weight_pounds: player.weight_pounds,
          season_data: season_data
          // team: [Object],
        });
      }
    });

    setResults(activePlayers);
  }

  //  {"games_played":34,"player_id":34,"season":2018,
  // "min":"19:19","fgm":2.41,"fga":6.76,"fg3m":0.85,"fg3a":2.88,"ftm":0.47,
  // "fta":0.82,"oreb":0.35,"dreb":1.5,"reb":1.85,"ast":3.5,"stl":0.53,"blk":0.06,
  // "turnover":0.94,"pf":1.65,"pts":6.15,"fg_pct":0.357,"fg3_pct":0.296,"ft_pct":0.571}
  const generateSeasonTable = (playerSeasonData) => {
    let fantasyPoints = getFantasyPoints(playerSeasonData);

    return (
      <div>
        <center>
          <table>
            <tr>{KEYS.map(key => <th className={styles.tableCell}>{key}</th>)}</tr>
            <tr>{KEYS.map(key => <td className={styles.tableCell}>{playerSeasonData[key]}</td>)}</tr>
          </table>
        </center>

        <p>Fantasy Points: {fantasyPoints.toFixed(1)}</p>

        {/* <table>
          <tr>
            {SECONDARY_KEYS.map(key => <th className={styles.tableCell}>{key}</th>)}
          </tr>

          <tr>
            {SECONDARY_KEYS.map(key => <td className={styles.tableCell}>{playerSeasonData[key]}</td>)}
          </tr>
        </table> */}
      </div>
    )
  }

  const getFantasyPoints = (playerSeasonData) => {
    let score = 0;
    score += playerSeasonData["reb"] * 1.2 + playerSeasonData["pts"] + playerSeasonData["ast"] * 1.5 + playerSeasonData["stl"] * 3 + playerSeasonData["blk"] * 3 - playerSeasonData["turnover"];
    return score;
  }

  // This function runs at the very beginning of every page load
  React.useEffect(() => {
    const asyncWrapper = async () => {
      getPlayers();
      let data = await getArticles();
      setArticles(data);
    }

    asyncWrapper();
  }, []);

  return (
    <div>
      <Head>
        <title>Fantasy Points Predictor</title>
        <meta name="description" content="Core web vitals walk through" />
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter"
          rel="stylesheet"
        />
      </Head>

      <main className={styles.container}>
        <div>
          <h2 className={styles.secondaryHeading}>Player Lookup</h2>
          <input
            type="text"
            placeholder="player search..."
            className={styles.input}
            onChange={event => getPlayers(event.target.value) }
          />

          <ul className={styles.players}>
            {results.map((player, i) => (
              <div key={i} className={styles.playerCard}>
                <p className={styles.boldedName}>{player.first_name} {player.last_name}</p>
                <p>{player.position}</p>
                <p>{player.height_feet}' {player.height_inches}"</p>
                {generateSeasonTable(player.season_data)}
              </div>
            ))}
          </ul>

          <ul className={styles.articles}>
            {articles.map((article, i) => (
              <div key={i} className={styles.articleCard}>
                <a href={article.url} className={styles.boldedName}>{article.title}</a>
                <p>{article.source}</p>
              </div>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}