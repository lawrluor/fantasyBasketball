import { useState } from 'react';
import Head from 'next/head';

import Fuse from 'fuse.js';
import _ from 'lodash';

import styles from '../styles/Home.module.css';
import CodeSampleModal from '../components/CodeSampleModal';

export default function Start({ players }) {
  const [results, setResults] = useState(players);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fuse = new Fuse(players, {
    keys: ['name'],
    threshold: 0.3,
  });

  const handleModal = () => {
    console.log("clicked modal button")
    setIsModalOpen(true);
  }

  return (
    <div>
      <Head>
        <title>Core Web Vitals</title>
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
            onChange={async (e) => {
              const { value } = e.currentTarget;

              const searchResult = fuse
                .search(value)
                .map((result) => result.item);

              const updatedResults = searchResult.length
                ? searchResult
                : players;
              setResults(updatedResults);

              // Fake analytics hit
              console.info({
                searchedAt: _.now(),
              });
            }}
          />

          <ul className={styles.players}>
            {results.map((player, i) => (
              <li key={i} className={styles.player}>
                <p>{player.first_name} {player.last_name}</p>
                <p>{player.position}</p>
                <p>{player.height_feet}' {player.height_inches}"</p>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.codeSampleBlock}>
          <h2 className={styles.secondaryHeading}>Code Sample</h2>
          <p>Ever wondered how to write a function that prints Hello World?</p>

          <button onClick={handleModal}>Show Me</button>
          <CodeSampleModal
            isOpen={isModalOpen}
            closeModal={() => setIsModalOpen(false)}
          />
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  const response = await fetch('https://www.balldontlie.io/api/v1/players');
  let players = await response.json();
  players = players.data

  return {
    props: {
      players: players.map((player) => (
        {
          id: player.id,
          first_name: player.first_name,
          height_feet: player.height_feet,
          height_inches: player.height_inches,
          last_name: player.last_name,
          position: player.position,
          weight_pounds: player.weight_pounds
          // team: [Object],
        }
      ))
    }
  };
}