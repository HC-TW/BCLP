import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

class LoginNavbar extends Component {

	render() {
		return (
			<nav class="navbar navbar-expand-lg navbar-light bg-light">
				<div class="container px-4 px-lg-5">
					<a class="navbar-brand font-monospace" href="/">BCOIP PRO</a>					
				</div>
			</nav>
		);
	}
}

export default LoginNavbar;