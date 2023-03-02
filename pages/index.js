import React from 'react';
import Head from 'next/head';

import styles from '../styles/Home.module.css';

export default function Start() {
  const [results, setResults] = React.useState([]);

  const getSeasonData = async (players, year) => {
    const url = `https://www.balldontlie.io/api/v1/season_averages?season=${year}`;
    const playerIdsString = players.map(player => `&player_ids[]=${player.id}`).join("");
    console.log(url + playerIdsString);
    const response = await fetch(url + playerIdsString);
    let data = await response.json();
    console.log(data);
  }

  const getPlayers = async (query="") => {
    const url = 'https://www.balldontlie.io/api/v1/players?search=';
    const response = await fetch(url + query);
    let players = await response.json();
    players = players.data;

    let seasonData = getSeasonData(players, "2018");

    players = players.map((player) => {
        return {
          id: player.id,
          first_name: player.first_name,
          last_name: player.last_name,
          height_feet: player.height_feet,
          height_inches: player.height_inches,
          position: player.position,
          weight_pounds: player.weight_pounds
          // team: [Object],
        }
    });

    setResults(players);
  }

  React.useEffect(() => {
    getPlayers();
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
              <li key={i} className={styles.player}>
                <p>{player.first_name} {player.last_name}</p>
                <p>{player.position}</p>
                <p>{player.height_feet}' {player.height_inches}"</p>
                {/* <p>{JSON.stringify(player.seasonData)}</p> */}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}