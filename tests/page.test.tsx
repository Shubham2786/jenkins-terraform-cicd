import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/page';

describe('DevOps CI/CD Automation Dashboard Page', () => {
  it('renders the main dashboard heading', () => {
    render(<DashboardPage />);
    const heading = screen.getByRole('heading', {
      name: /devops ci\/cd automation dashboard/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('displays the Running status indicator', () => {
    render(<DashboardPage />);
    const status = screen.getByText(/running/i);
    expect(status).toBeInTheDocument();
  });

  it('displays deployment and runtime details', () => {
    render(<DashboardPage />);
    const elements = screen.getAllByText(/devops-cicd-dashboard/i);
    expect(elements.length).toBeGreaterThan(0);
    expect(screen.getByText(/deployment information/i)).toBeInTheDocument();
  });

  it('renders CI/CD pipeline stage names', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/checkout source code/i)).toBeInTheDocument();
    expect(screen.getByText(/next\.js production build/i)).toBeInTheDocument();
    expect(screen.getByText(/deployment to aws ec2/i)).toBeInTheDocument();
  });
});
