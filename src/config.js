/**
 * JWT config.
 */
exports.JWTconfig = {
	algorithms: ['HS256'],
	secret: 'shhhh', // TODO Put in process.env
};

exports.Adminconfig = {
	address: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
	key: '4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'
}

exports.Regulatorconfig = {
	address: '0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e',
}
