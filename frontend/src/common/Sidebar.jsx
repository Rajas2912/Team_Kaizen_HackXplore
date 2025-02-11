import * as React from 'react'
import { extendTheme, styled } from '@mui/material/styles'
import { Avatar, Typography, Box, IconButton } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HomeIcon from '@mui/icons-material/Home'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import BarChartIcon from '@mui/icons-material/BarChart'
import DescriptionIcon from '@mui/icons-material/Description'
import MicIcon from '@mui/icons-material/Mic'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import VisibilityIcon from '@mui/icons-material/Visibility'
import InsightsIcon from '@mui/icons-material/Insights'
import PersonIcon from '@mui/icons-material/Person'
import SchoolIcon from '@mui/icons-material/School'
import SettingsIcon from '@mui/icons-material/Settings'
import LockIcon from '@mui/icons-material/Lock'
import PaletteIcon from '@mui/icons-material/Palette'

import { AppProvider } from '@toolpad/core/AppProvider'
import { DashboardLayout } from '@toolpad/core/DashboardLayout'
import { PageContainer } from '@toolpad/core/PageContainer'
import Grid from '@mui/material/Grid2'

import './Sidebar.css'

const NAVIGATION = [
  {
    kind: 'header',
    title: 'Main',
  },
  {
    segment: 'home',
    title: 'Home',
    icon: <HomeIcon />,
  },
  {
    segment: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },

  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Teaching & Assessments',
  },
  {
    segment: 'study-materials',
    title: 'Teaching',
    icon: <LibraryBooksIcon />,
    children: [
      {
        segment: 'maths',
        title: 'Maths',
      },
      {
        segment: 'physics',
        title: 'Physics',
      },
    ],
  },
  {
    segment: 'assignments',
    title: 'Assignments',
    icon: <DescriptionIcon />,
  },
  {
    segment: 'quizzes',
    title: 'Quizzes',
    icon: <BarChartIcon />,
  },
  {
    segment: 'viva',
    title: 'Viva Assessment',
    icon: <MicIcon />,
  },

  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Attendance & Scheduling',
  },
  {
    segment: 'attendance',
    title: 'Attendance',
    icon: <CheckCircleIcon />,
  },
  {
    segment: 'timetable',
    title: 'Timetable Generator',
    icon: <CalendarMonthIcon />,
  },
  {
    segment: 'progress-tracking',
    title: 'Progress Tracking',
    icon: <TrendingUpIcon />,
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'AI Monitoring & Reports',
  },
  {
    segment: 'proctoring-reports',
    title: 'Proctoring Reports',
    icon: <VisibilityIcon />,
  },
  {
    segment: 'performance-analytics',
    title: 'Performance Analytics',
    icon: <InsightsIcon />,
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'User Management',
  },
  {
    segment: 'teachers',
    title: 'Teachers',
    icon: <PersonIcon />,
  },
  {
    segment: 'students',
    title: 'Students',
    icon: <SchoolIcon />,
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Settings',
  },
  {
    segment: 'settings',
    title: 'Settings',
    icon: <SettingsIcon />,
  },
  {
    segment: 'security',
    title: 'Security & Privacy',
    icon: <LockIcon />,
  },
  {
    segment: 'theme',
    title: 'Theme & UI',
    icon: <PaletteIcon />,
  },
]

// const NAVIGATION = [
//   {
//     kind: 'header',
//     title: 'Main items',
//   },
//   {
//     segment: 'dashboard',
//     title: 'Dashboard',
//     icon: <DashboardIcon />,
//   },
//   {
//     segment: 'home',
//     title: 'Home',
//     icon: <ShoppingCartIcon />,
//   },
//   {
//     kind: 'divider',
//   },
//   {
//     kind: 'header',
//     title: 'Analytics',
//   },
//   {
//     segment: 'reports',
//     title: 'Reports',
//     icon: <BarChartIcon />,
//     children: [
//       {
//         segment: 'sales',
//         title: 'Sales',
//         icon: <DescriptionIcon />,
//       },
//       {
//         segment: 'traffic',
//         title: 'Traffic',
//         icon: <DescriptionIcon />,
//       },
//     ],
//   },
//   {
//     segment: 'integrations',
//     title: 'Integrations',
//     icon: <LayersIcon />,
//   },
// ]

const demoTheme = extendTheme({
  colorSchemes: { light: true },
  colorSchemeSelector: 'class',
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
})

function useDemoRouter(initialPath) {
  const [pathname, setPathname] = React.useState(initialPath)

  const router = React.useMemo(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    }
  }, [pathname])

  return router
}

const Skeleton = styled('div')(({ theme, height }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  height,
  content: '" "',
}))

export default function Sidebar(props) {
  const { window } = props
  const router = useDemoRouter('/dashboard')

  // Remove this const when copying and pasting into your project.
  //   const demoWindow = window ? window() : undefined

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      //   window={demoWindow}
    >
      <DashboardLayout>
        <PageContainer>
          <Grid container spacing={1}>
            <Grid xs={12}>
              <Box display="flex" alignItems="center" p={2}>
                <Avatar
                  alt="User Name"
                  src="/path-to-profile-image.jpg"
                  sx={{ mr: 2 }}
                />
                <Typography variant="h6">User Name</Typography>
              </Box>
            </Grid>

            {/* Add Settings or Profile Button */}
            <Grid xs={12}>
              <Box display="flex" justifyContent="flex-end" p={2}>
                <IconButton>
                  <SettingsIcon />
                </IconButton>
              </Box>
            </Grid>

            <Grid xs={5} />
            <Grid xs={12}>
              <Skeleton height={14} />
            </Grid>
            <Grid xs={12}>
              <Skeleton height={14} />
            </Grid>
            <Grid xs={4}>
              <Skeleton height={100} />
            </Grid>
            <Grid xs={8}>
              <Skeleton height={100} />
            </Grid>

            <Grid xs={12}>
              <Skeleton height={150} />
            </Grid>
            <Grid xs={12}>
              <Skeleton height={14} />
            </Grid>

            <Grid xs={3}>
              <Skeleton height={100} />
            </Grid>
            <Grid xs={3}>
              <Skeleton height={100} />
            </Grid>
            <Grid xs={3}>
              <Skeleton height={100} />
            </Grid>
            <Grid xs={3}>
              <Skeleton height={100} />
            </Grid>
          </Grid>
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  )
}
