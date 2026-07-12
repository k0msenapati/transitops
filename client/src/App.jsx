import { Route, Switch } from 'wouter'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
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
        <Route path="/dashboard" component={DashboardPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </AuthProvider>
  )
}
