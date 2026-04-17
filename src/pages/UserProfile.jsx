import React from "react";
import "../css/UserProfile.css";
import profilePic from "../assets/johndoe.png";

export default function UserProfile() {
  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="left-column">
          <div className="card profile-card">
            <img
              className="profile-img"
              src={profilePic}
              alt="Profile"
            />

            <h1 className="profile-name">John Doe</h1>
            <p className="profile-subtitle">Senior</p>
            <p className="profile-description">Computer Science BS</p>

            <div className="profile-actions">
              <button className="btn btn-primary">Follow</button>
              <button className="btn btn-outline">Message</button>
            </div>
          </div>

          <div className="card social-card">
            <div className="social-row">
              <div className="social-left">Website</div>
              <div className="social-right">website.com</div>
            </div>
            <div className="social-row">
              <div className="social-left">Twitter</div>
              <div className="social-right">@johndoe</div>
            </div>
            <div className="social-row">
              <div className="social-left">Facebook</div>
              <div className="social-right">John Doe</div>
            </div>
            <div className="social-row">
              <div className="social-left">Instagram</div>
              <div className="social-right">@john.doe</div>
            </div>
          </div>
        </div>

        <div className="right-column">
          <div className="card">
            <table className="info-table">
              <tbody>
                <tr>
                  <td>Full Name</td>
                  <td>John Doe</td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td>johndoe@ualr.edu</td>
                </tr>
                <tr>
                  <td>Phone</td>
                  <td>(123) 456-7890</td>
                </tr>
                <tr>
                  <td>ID Number</td>
                  <td>123456789</td>
                </tr>
                <tr>
                  <td>Major</td>
                  <td>Computer Science</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="stats-grid">
            <div className="card">
              <div className="section-title">Student Info</div>

              <div className="stat-item">
                <span className="stat-label">Credits Completed</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "45%" }}></div>
                </div>
              </div>

              <div className="stat-item">
                <span className="stat-label">Degree Progress</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "65%" }}></div>
                </div>
              </div>

              <div className="stat-item">
                <span className="stat-label">Semester Progress</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "72%" }}></div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-title">Activity</div>

              <div className="stat-item">
                <span className="stat-label">Events Attended</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "58%" }}></div>
                </div>
              </div>

              <div className="stat-item">
                <span className="stat-label">Profile Completion</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "80%" }}></div>
                </div>
              </div>

              <div className="stat-item">
                <span className="stat-label">Engagement</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "50%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}