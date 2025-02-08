const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.roles) return res.status(403).json({ message: 'No se recibieron roles en la petición.' });

    const userRoles = req.roles;
    const allowedRolesArray = [...allowedRoles];

    const isUserAllowed = allowedRolesArray.some(role => userRoles.includes(role));

    if (!isUserAllowed) return res.status(403).json({ message: 'No puedes acceder debido a tus roles.' });

    next();
  }
}

module.exports = verifyRoles;