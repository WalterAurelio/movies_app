const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  
  if (!firstname || !lastname || !email || !password) return res.status(400).json({ message: 'Todos los campos son necesarios.' });

  try {
    const duplicated = await User.findOne({ email });
    if (duplicated) return res.status(409).json({ message: 'Ya existe un usuario registrado con este email.' });
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword
    });
    res.status(201).json({
      user: {
        ...newUser._doc,
        password: undefined
      }
    });
  } catch (error) {
    console.log(`Ocurrió un error en el registro de usuario. ${error.message}`);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const cookies = req.cookies;

  if (!email || !password) return res.status(400).json({ message: 'Todos los campos son necesarios.' });

  try {
    const foundUser = await User.findOne({ email });
    if (!foundUser) return res.status(401).json({ message: 'No existe un usuario registrado con este email.' });

    const validPassword = await bcrypt.compare(password, foundUser.password);
    if (!validPassword) return res.status(401).json({ message: 'La contraseña ingresada es incorrecta.' });

    const roles = Object.values(foundUser.roles);
    const accessToken = jwt.sign(
      { email: foundUser.email, roles },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1s' }
    );
    const newRefreshToken = jwt.sign(
      { email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '10s' }
    );

    let newRefreshTokenArray = !cookies?.jwt ?
      foundUser.refreshToken : foundUser.refreshToken.filter(rt => rt !== cookies.jwt);

    if (cookies?.jwt) {
      const refreshToken = cookies.jwt;
      const foundUser = await User.findOne({ refreshToken });
      if (!foundUser) {
        newRefreshTokenArray = [];
      }
      res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' });
    }

    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await foundUser.save();
    res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite: 'None', maxAge: 1000 * 60 * 60 * 24 });
    res.json({ accessToken, roles });
  } catch (error) {
    console.log(`Ocurrió un error en el inicio de sesión. ${error.message}`);
  }
};

const logout = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(204);

  const refreshToken = cookies.jwt;
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' });

  const foundUser = await User.findOne({ refreshToken });
  if (!foundUser) return res.sendStatus(204);

  foundUser.refreshToken = foundUser.refreshToken.filter(rt => rt !== refreshToken);
  await foundUser.save();
  res.sendStatus(204);
};

const refresh = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(403).json({ message: 'No se recibió un refresh token en la petición.' });

  const refreshToken = cookies.jwt;
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' });

  const foundUser = await User.findOne({ refreshToken });
  if (!foundUser) {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Se recibió un refresh token vencido que no pertenece a ningún usuario.' });

      const hackedUser = await User.findOne({ email: decoded.email });
      hackedUser.refreshToken = [];
      await hackedUser.save();
    });
    res.status(403).json({ message: 'Se detectó un posible ataque. Por favor, vuelva a iniciar sesión.' });
  }

  const newRefreshTokenArray = foundUser.refreshToken.filter(rt => rt !== refreshToken);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
    if (err || decoded.email !== foundUser.email) {
      foundUser.refreshToken = [...newRefreshTokenArray];
      await foundUser.save();
      return res.status(401).json({ message: 'El refresh token está vencido. Por favor, vuelva a iniciar sesión.' });
    }

    const roles = Object.values(foundUser.roles);
    const accessToken = jwt.sign(
      { email: foundUser.email, roles },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1m' }
    );
    const newRefreshToken = jwt.sign(
      { email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await foundUser.save();
    res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite: 'None', maxAge: 1000 * 60 * 60 * 24 });
    res.json({ accessToken, roles });
  })
}

module.exports = {
  registerUser,
  login,
  logout,
  refresh
}