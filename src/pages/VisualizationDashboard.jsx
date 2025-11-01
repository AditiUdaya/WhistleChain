// src/pages/VisualizationDashboard.jsx
import { useState, useEffect } from "react";
import { Activity, CheckCircle, Clock, Shield, TrendingUp } from "lucide-react";
import "./VisualizationDashboard.css";

const VisualizationDashboard = () => {
  const [activeTab, setActiveTab] = useState("routing");
  const [activeNode, setActiveNode] = useState(0);
  const [liveTransactions, setLiveTransactions] = useState(267);
  const [verifiedLeaks, setVerifiedLeaks] = useState(89);
  const [activeNodes, setActiveNodes] = useState(1247);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const initialTransactions = generateTransactions(10);
    setTransactions(initialTransactions);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % 6);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTx = generateTransaction();
      setTransactions((prev) => [newTx, ...prev].slice(0, 15));
      setLiveTransactions((prev) => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNodes((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nodes = [
    { icon: "💻", name: "Your Device", location: "Local", flag: "" },
    { icon: "🔐", name: "Entry Node", location: "USA", flag: "🇺🇸" },
    { icon: "🌐", name: "Relay 1", location: "France", flag: "🇫🇷" },
    { icon: "🌐", name: "Relay 2", location: "Germany", flag: "🇩🇪" },
    { icon: "🚪", name: "Exit Node", location: "Netherlands", flag: "🇳🇱" },
    { icon: "⛓️", name: "Destination", location: "Blockchain", flag: "" },
  ];

  const timelineItems = [
    {
      date: "2025-01-15",
      title: "Corporate Tax Evasion Evidence",
      status: "verified",
      verifications: 12,
      impact: "critical",
    },
    {
      date: "2024-12-08",
      title: "Defense Budget Irregularities",
      status: "verified",
      verifications: 8,
      impact: "high",
    },
    {
      date: "2024-11-22",
      title: "Environmental Violation Documents",
      status: "pending",
      verifications: 3,
      impact: "medium",
    },
    {
      date: "2024-10-30",
      title: "Financial Misconduct Records",
      status: "verified",
      verifications: 15,
      impact: "critical",
    },
  ];

  function generateTransaction() {
    const types = ["submission", "verification", "multisig"];
    const type = types[Math.floor(Math.random() * types.length)];
    const status = Math.random() > 0.3 ? "confirmed" : "pending";

    return {
      id: Math.random().toString(36).substring(7),
      type,
      hash:
        "0x" +
        Array.from({ length: 32 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join(""),
      timestamp: new Date().toLocaleTimeString(),
      status,
      verifications:
        type === "verification" ? Math.floor(Math.random() * 20) + 1 : undefined,
    };
  }

  function generateTransactions(count) {
    return Array.from({ length: count }, () => generateTransaction());
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case "submission":
        return "📤";
      case "verification":
        return "✅";
      case "multisig":
        return "🔏";
      default:
        return "📄";
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case "critical":
        return "impact-critical";
      case "high":
        return "impact-high";
      case "medium":
        return "impact-medium";
      default:
        return "impact-low";
    }
  };

  return (
    <div className="visualization-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">📊 Visualization Dashboard</h1>
            <p className="dashboard-subtitle">
              Real-time monitoring of encryption paths, blockchain activity, and source credibility
            </p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <p className="stat-label">Live Transactions</p>
                <p className="stat-value text-purple">{liveTransactions}</p>
              </div>
              <Activity className="stat-icon text-purple" />
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <p className="stat-label">Verified Leaks</p>
                <p className="stat-value text-green">{verifiedLeaks}</p>
              </div>
              <CheckCircle className="stat-icon text-green" />
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <p className="stat-label">Active Nodes</p>
                <p className="stat-value text-blue">{activeNodes.toLocaleString()}</p>
              </div>
              <TrendingUp className="stat-icon text-blue" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs-header">
            <button
              onClick={() => setActiveTab("routing")}
              className={`tab-button ${activeTab === "routing" ? "active" : ""}`}
            >
              🧅 Onion Routing
            </button>
            <button
              onClick={() => setActiveTab("blockchain")}
              className={`tab-button ${activeTab === "blockchain" ? "active" : ""}`}
            >
              ⛓️ Blockchain Feed
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`tab-button ${activeTab === "timeline" ? "active" : ""}`}
            >
              📅 Source Timeline
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content animate-fade-in">
          {activeTab === "routing" && (
            <div className="tab-section">
              {/* Onion Routing */}
              <div className="glass-card">
                <h2 className="section-title">Multi-Hop Encryption Path</h2>
                <div className="nodes-container">
                  {nodes.map((node, index) => (
                    <div key={index} className="node-wrapper">
                      <div className="node-flex">
                        <div
                          className={`node-circle ${
                            activeNode === index ? "active-node" : ""
                          }`}
                        >
                          {node.flag || node.icon}
                        </div>
                        <p className="node-name">{node.name}</p>
                        <p className="node-location">{node.location}</p>
                      </div>
                      {index < nodes.length - 1 && (
                        <div className="node-arrow">→</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Boxes */}
              <div className="info-grid">
                <div className="info-card">
                  <h3 className="info-title">🔒 Multi-Layer Encryption</h3>
                  <p className="info-text">
                    Each hop adds an encryption layer, ensuring no single node
                    knows the complete path
                  </p>
                </div>
                <div className="info-card">
                  <h3 className="info-title">🌍 Global Network</h3>
                  <p className="info-text">
                    Data routed through multiple countries makes tracking
                    virtually impossible
                  </p>
                </div>
                <div className="info-card">
                  <h3 className="info-title">⚡ Low Latency</h3>
                  <p className="info-text">
                    Optimized routing ensures fast submission while maintaining
                    maximum security
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "blockchain" && (
            <div className="tab-section">
              {/* Blockchain Feed */}
              <div className="glass-card">
                <h2 className="section-title">Live Transaction Feed</h2>
                <div className="transactions-list">
                  {transactions.map((tx, index) => (
                    <div
                      key={tx.id}
                      className="transaction-card animate-slide-in-left"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="transaction-icon">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div className="transaction-info">
                        <div className="transaction-header">
                          <p className="transaction-type">
                            {tx.type.replace("-", " ")}
                          </p>
                          <span
                            className={`transaction-badge ${
                              tx.status === "confirmed"
                                ? "badge-confirmed"
                                : "badge-pending"
                            }`}
                          >
                            {tx.status === "confirmed" ? "✓ Confirmed" : "⏳ Pending"}
                          </span>
                        </div>
                        <p className="transaction-hash">
                          {tx.hash.substring(0, 20)}...
                          {tx.hash.substring(tx.hash.length - 8)}
                        </p>
                        <p className="transaction-time">{tx.timestamp}</p>
                        {tx.verifications && (
                          <p className="transaction-verifications">
                            {tx.verifications} verifications
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <p className="stat-label">Leak Submissions</p>
                  <p className="stat-value text-purple">
                    {transactions.filter((t) => t.type === "submission").length}
                  </p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">Verifications</p>
                  <p className="stat-value text-green">
                    {transactions.filter((t) => t.type === "verification").length}
                  </p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">Multi-Sig Actions</p>
                  <p className="stat-value text-blue">
                    {transactions.filter((t) => t.type === "multisig").length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="tab-section">
              {/* Source Info */}
              <div className="glass-card">
                <h2 className="section-title">Source Profile</h2>
                <div className="source-profile">
                  <div className="source-id">
                    <p className="stat-label">Source ID</p>
                    <p className="source-hash">
                      0x7a3f8e2b9c4d1a5f6e8c2b4a9d7f3e1c5b8a6d4e2f1a9c7b5d3e1f8a6c4b2d0e...
                    </p>
                  </div>
                  <div className="source-stats">
                    <div className="source-stat">
                      <p className="stat-label">Total Leaks</p>
                      <p className="stat-value text-purple">24</p>
                    </div>
                    <div className="source-stat">
                      <p className="stat-label">Verified</p>
                      <p className="stat-value text-green">22</p>
                    </div>
                    <div className="source-stat">
                      <p className="stat-label">Accuracy</p>
                      <p className="stat-value text-blue">91.7%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="glass-card">
                <h2 className="section-title">Submission History</h2>
                <div className="timeline-container">
                  <div className="timeline-line" />
                  <div className="timeline-items">
                    {timelineItems.map((item, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-marker">
                          {item.status === "verified" ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                        </div>
                        <div className="timeline-card">
                          <div className="timeline-header">
                            <div className="timeline-title">
                              <p className="timeline-date">{item.date}</p>
                              <h3 className="timeline-heading">{item.title}</h3>
                            </div>
                            <div className="timeline-badges">
                              <span
                                className={`timeline-badge ${
                                  item.status === "verified"
                                    ? "badge-verified"
                                    : "badge-pending"
                                }`}
                              >
                                {item.status === "verified"
                                  ? "Verified"
                                  : "Pending"}
                              </span>
                              <span
                                className={`timeline-badge ${getImpactColor(
                                  item.impact
                                )}`}
                              >
                                {item.impact.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <p className="timeline-text">
                            {item.verifications} independent verifications
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trust Score */}
              <div className="glass-card trust-score">
                <div className="trust-content">
                  <Shield className="trust-icon" />
                  <div>
                    <h3 className="trust-title">🛡️ Trust Score: 92%</h3>
                    <p className="trust-text">
                      Based on verification history, accuracy rate, and community
                      consensus
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizationDashboard;
