import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [jobIds, setJobIds] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [cursor, setCursor] = useState(0);
  useEffect(() => {
    async function fetchJobIds() {
      try {
        const res = await fetch(
          "https://hacker-news.firebaseio.com/v0/jobstories.json"
        );
        const data = await res.json();
        setJobIds(data);
      } catch (error) {
        console.log(error);
      }
    }

    fetchJobIds();
  }, []);

  useEffect(() => {
    async function fetchJobs() {
      if (!jobs && jobIds) {
        const jobsPromise = jobIds.slice(0, 9).map(async (id) => {
          try {
            const res = await fetch(
              `https://hacker-news.firebaseio.com/v0/item/${id}.json`
            );
            const data = await res.json();
            return data;
          } catch (error) {
            console.log(error);
          }
        });
        const data = await Promise.all(jobsPromise);
        setJobs(data);
        setCursor(9);
      }
    }

    fetchJobs();
  }, [jobIds]);

  function formatBody(text) {
    const message = text.toLowerCase().split("is hiring")[1];
    return `is hiring ${message}`;
  }

  function formatDate(date) {
    const time = date * 1000;
    const timestamp = new Date(time).toLocaleDateString();
    return timestamp;
  }

  async function loadMore() {
    if (cursor < jobIds.length) {
      try {
        const jobsPromise = jobIds.slice(cursor, cursor + 6).map(async (id) => {
          const response = await fetch(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json`
          );
          const data = await response.json();
          return data;
        });
        const data = await Promise.all(jobsPromise);
        setJobs((prev) => [...prev, ...data]);
        setCursor((prev) => prev + 6);
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <div className="App">
      <h1>HN Jobs</h1>
      <div className="wrapper">
        {jobs &&
          jobs.map((job) => (
            <div key={job.id} className="jobCard">
              <h2>
                <a href={job.url} target="_blank">
                  {job.title.split(" ")[0]}{" "}
                  {job.title.split(" ")[1].includes("YC") ? "YC" : null}
                </a>
              </h2>
              <p>{formatBody(job.title)}</p>
              <p>{formatDate(job.time)}</p>
            </div>
          ))}
      </div>
      <button onClick={loadMore} style={{ marginTop: "20px" }}>
        Load More
      </button>
    </div>
  );
}
