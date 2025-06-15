import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  User as UserIcon,
  Lock as LockIcon,
} from 'lucide-react';
import Carousel from 'react-material-ui-carousel';
import { useAuth } from '../../../contexts/AuthContext';

const carouselItems = [
  {
    image: "/public/ubv2.jpg",
    title: "Excelencia Académica",
    description: "Formando profesionales con los más altos estándares de calidad"
  },
  {
    image: "/public/ubv4.webp",
    title: "Innovación Educativa",
    description: "Implementando tecnologías modernas en la gestión académica"
  },
  {
    image: "/public/monagas.jpg",
    title: "Compromiso Social",
    description: "Contribuyendo al desarrollo de nuestra sociedad"
  }
];

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      // Si llegamos aquí, el login fue exitoso y el usuario será redirigido
    } catch (err: any) {
      // Mostrar el mensaje de error específico del API
      let errorMessage = 'Ocurrió un error al iniciar sesión';
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: theme.palette.background.default,
      }}
    >
      {/* Login Section */}
      <Box
        sx={{
          width: isMobile ? '100%' : '40%',
          maxWidth: '500px',
          minWidth: '320px',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'white',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 80,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <img src="/public/icons.png" alt="UBV LOGO" />
          </Box>

          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 1,
              fontWeight: 700,
              color: theme.palette.primary.main,
              textAlign: 'center',
            }}
          >
            Bienvenido
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: theme.palette.text.secondary,
              textAlign: 'center',
              mb: 3,
            }}
          >
            Sistema de Gestión de Horarios UBV
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              width: '100%',
              mb: 3,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            '& .MuiTextField-root': {
              mb: 2,
            },
          }}
        >
          <TextField
            required
            fullWidth
            id="username"
            label="Nombre de usuario"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <UserIcon size={20} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <TextField
            required
            fullWidth
            name="password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon size={20} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              mt: 2,
              mb: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
              },
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Iniciar Sesión'
            )}
          </Button>

          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{ mt: 2 }}
          >
            <Typography variant="body2" color="text.secondary">
              ¿Necesitas acceso? Contacta al administrador del sistema.
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Carousel Section */}
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            position: 'relative',
          }}
        >
          <Carousel
            animation="slide"
            autoPlay={true}
            indicators={false}
            navButtonsAlwaysInvisible={true}
            duration={800}
            sx={{
              height: '100%',
            }}
          >
            {carouselItems.map((item, index) => (
              <Box
                key={index}
                sx={{
                  height: '100vh',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    zIndex: 1,
                  },
                }}
              >
                <Box
                  component="img"
                  src={item.image}
                  alt={item.title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '15%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textAlign: 'center',
                    color: 'white',
                    zIndex: 2,
                    width: '80%',
                  }}
                >
                  <Typography
                    variant="h4"
                    component="h2"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Carousel>
        </Box>
      )}
    </Box>
  );
};

export default Login;