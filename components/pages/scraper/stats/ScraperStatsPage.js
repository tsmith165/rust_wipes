'use client'

import { Component } from "react";
import styles from "../../../../styles/pages/ScraperStats.module.scss";

class ScraperStatsPage extends Component {
  state = {
    stats: [],
    currentPage: 1,
    totalPages: 1,
  };

  componentDidMount = async () => {
    await this.fetchStats();
  };

  fetchStats = async () => {
    const { currentPage } = this.state;
    const res = await fetch(`/api/scraper?page=${currentPage}`);
    const { stats, totalPages } = await res.json();
    this.setState({ stats, totalPages });
  };

  handlePrevPage = () => {
    this.setState(
      (prevState) => ({ currentPage: prevState.currentPage - 1 }),
      this.fetchStats
    );
  };

  handleNextPage = () => {
    this.setState(
      (prevState) => ({ currentPage: prevState.currentPage + 1 }),
      this.fetchStats
    );
  };

  render() {
    console.log(("-".repeat(15)) + " Rendering Scrapper Stats Page " + ("-".repeat(15)))

    const { stats, currentPage, totalPages } = this.state;

    return (
      <div className={styles["scraper-stats-page"]}>
        <h1>Scraper Stats</h1>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Duration</th>
                <th>Servers Parsed</th>
                <th>Servers Skipped</th>
                <th>Servers Posted</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => (
                <tr key={stat.id}>
                  <td>{new Date(stat.date).toLocaleString()}</td>
                  <td>
                    {Math.floor(stat.scraper_duration / 60)}min{" "}
                    {stat.scraper_duration % 60}s
                  </td>
                  <td>{stat.servers_parsed}</td>
                  <td>{stat.servers_skipped}</td>
                  <td>{stat.servers_posted}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles["pagination"]}>
            <button
              onClick={this.handlePrevPage}
              disabled={currentPage <= 1}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={this.handleNextPage}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ScraperStatsPage;