import React from 'react';

export default function DashboardPage() {
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || 'v1.0.0';
  const environment = process.env.NEXT_PUBLIC_ENV || 'production';
  const buildId = process.env.NEXT_PUBLIC_BUILD_ID || 'build-local-01';
  const deployTarget = process.env.NEXT_PUBLIC_DEPLOY_TARGET || 'AWS EC2 (Ubuntu 22.04 LTS)';

  const pipelineStages = [
    { num: '01', name: 'Checkout Source Code', status: 'Passed' },
    { num: '02', name: 'Environment Setup', status: 'Passed' },
    { num: '03', name: 'Install Dependencies', status: 'Passed' },
    { num: '04', name: 'Code Quality & Validation', status: 'Passed' },
    { num: '05', name: 'Automated Testing', status: 'Passed' },
    { num: '06', name: 'Next.js Production Build', status: 'Passed' },
    { num: '07', name: 'Docker Image Build', status: 'Passed' },
    { num: '08', name: 'Docker Image Validation', status: 'Passed' },
    { num: '09', name: 'Deployment to AWS EC2', status: 'Passed' },
    { num: '10', name: 'Post-Deployment Verification', status: 'Passed' },
  ];

  return (
    <div className="container">
      <header>
        <div>
          <h1 className="brand-title">DevOps CI/CD Automation Dashboard</h1>
          <p className="brand-subtitle">
            Automated Next.js delivery pipeline powered by Jenkins CI/CD and Terraform Modular IaC
          </p>
        </div>
        <div>
          <span className="status-badge healthy">
            <span className="pulse-dot"></span>
            Running
          </span>
        </div>
      </header>

      {/* Top Metric Cards */}
      <div className="grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Application Status</span>
            <span className="card-tag">Health</span>
          </div>
          <div className="metric-value" style={{ color: '#34d399' }}>Healthy</div>
          <p className="metric-desc">HTTP 200 OK via <code>/api/health</code></p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">CI/CD Engine</span>
            <span className="card-tag">Jenkins</span>
          </div>
          <div className="metric-value">Automated</div>
          <p className="metric-desc">10-stage declarative pipeline active</p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Infrastructure</span>
            <span className="card-tag">Terraform</span>
          </div>
          <div className="metric-value">AWS EC2</div>
          <p className="metric-desc">Modular VPC + Security Group + EC2</p>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Container Engine</span>
            <span className="card-tag">Docker</span>
          </div>
          <div className="metric-value">Multi-Stage</div>
          <p className="metric-desc">Minimal Node.js Alpine runtime</p>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="grid">
        {/* Build & Deployment Details */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Deployment Information</h2>
            <span className="card-tag">Runtime</span>
          </div>
          <table className="info-table">
            <tbody>
              <tr>
                <td className="label">Application Name</td>
                <td className="val">devops-cicd-dashboard</td>
              </tr>
              <tr>
                <td className="label">Application Version</td>
                <td className="val">{appVersion}</td>
              </tr>
              <tr>
                <td className="label">Environment</td>
                <td className="val">{environment}</td>
              </tr>
              <tr>
                <td className="label">Build Identifier</td>
                <td className="val">{buildId}</td>
              </tr>
              <tr>
                <td className="label">Target Platform</td>
                <td className="val">{deployTarget}</td>
              </tr>
              <tr>
                <td className="label">Application Port</td>
                <td className="val">3000 (Internal) / 80 (HTTP)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* API Health Check */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">API Health Endpoint</h2>
            <span className="card-tag">REST API</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
            Automated health verification endpoint queried by Jenkins Stage 8 &amp; 10:
          </p>
          <div className="code-snippet">
            GET /api/health
            <br />
            {JSON.stringify(
              {
                status: 'healthy',
                application: 'devops-cicd-dashboard',
              },
              null,
              2
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.75rem' }}>
            Verified with Jest &amp; Supertest integration tests during CI.
          </p>
        </div>
      </div>

      {/* Pipeline Status Overview */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Jenkins CI/CD Declarative Pipeline Stages</h2>
          <span className="card-tag">Pipeline Workflow</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
          Automated end-to-end pipeline executing in strict sequence upon git push:
        </p>
        <div className="pipeline-list">
          {pipelineStages.map((stage) => (
            <div key={stage.num} className="pipeline-stage">
              <div className="stage-name">
                <span className="stage-num">{stage.num}</span>
                <span>{stage.name}</span>
              </div>
              <span className="stage-status">{stage.status}</span>
            </div>
          ))}
        </div>
      </div>

      <footer>
        <p>
          Academic DevOps Project &bull; Jenkins CI/CD &amp; Terraform Modular Infrastructure as Code
        </p>
      </footer>
    </div>
  );
}

