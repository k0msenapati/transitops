import { Route, Switch } from 'wouter'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import DashboardLayout from './components/DashboardLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import VehiclesPage from './pages/VehiclesPage'
import DriversPage from './pages/DriversPage'
import TripsPage from './pages/TripsPage'
import MaintenancePage from './pages/MaintenancePage'
import CompliancePage from './pages/CompliancePage'
import ExpensesPage from './pages/ExpensesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/" component={LandingPage} />

        <Route path="/login">
          <Layout>
            <LoginPage />
          </Layout>
        </Route>
        
        <Route path="/register">
          <Layout>
            <RegisterPage />
          </Layout>
        </Route>

        <Route path="/dashboard">
          <DashboardLayout>
            <DashboardPage />
          </DashboardLayout>
        </Route>

        <Route path="/dashboard/vehicles">
          <DashboardLayout>
            <VehiclesPage />
          </DashboardLayout>
        </Route>

        <Route path="/dashboard/drivers">
          <DashboardLayout>
            <DriversPage />
          </DashboardLayout>
        </Route>

        <Route path="/dashboard/trips">
          <DashboardLayout>
            <TripsPage />
          </DashboardLayout>
        </Route>

        <Route path="/dashboard/maintenance">
          <DashboardLayout>
            <MaintenancePage />
          </DashboardLayout>
        </Route>

        <Route path="/dashboard/compliance">
          <DashboardLayout>
            <CompliancePage />
          </DashboardLayout>
        </Route>

        <Route path="/dashboard/expenses">
          <DashboardLayout>
            <ExpensesPage />
          </DashboardLayout>
        </Route>

        <Route path="/dashboard/analytics">
          <DashboardLayout>
            <AnalyticsPage />
          </DashboardLayout>
        </Route>

        <Route path="/dashboard/settings">
          <DashboardLayout>
            <SettingsPage />
          </DashboardLayout>
        </Route>

        <Route component={NotFoundPage} />
      </Switch>
    </AuthProvider>
  )
}
