var require = meteorInstall({"imports":{"ui":{"AdminPanel.jsx":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// imports/ui/AdminPanel.jsx                                                                                  //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
!function (module1) {
  module1.export({
    AdminPanel: () => AdminPanel
  });
  let React, useState;
  module1.link("react", {
    default(v) {
      React = v;
    },
    useState(v) {
      useState = v;
    }
  }, 0);
  ___INIT_METEOR_FAST_REFRESH(module);
  var _s = $RefreshSig$();
  const AdminPanel = () => {
    _s();
    const [users, setUsers] = useState([]);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [deleteUsername, setDeleteUsername] = useState('');
    const handleAddUser = e => {
      e.preventDefault();
      if (newUsername.trim() === '') {
        alert('Please enter a username.');
        return;
      }
      const newUser = {
        id: Date.now(),
        // simple unique id
        username: newUsername,
        role: 'User'
      };
      setUsers([...users, newUser]);
      setNewUsername('');
      setNewPassword('');
    };
    const handleDeleteUser = e => {
      e.preventDefault();
      if (deleteUsername.trim() === '') {
        alert('Please enter a username to delete.');
        return;
      }
      if (!users.find(user => user.username === deleteUsername)) {
        alert('User not found.');
        return;
      }
      setUsers(users.filter(user => user.username !== deleteUsername));
      setDeleteUsername('');
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "admin-panel"
    }, /*#__PURE__*/React.createElement("div", {
      className: "admin-header"
    }, /*#__PURE__*/React.createElement("h1", null, "Welcome to the Admin Panel"), /*#__PURE__*/React.createElement("p", {
      className: "admin-user-role"
    }, "User as Admin")), /*#__PURE__*/React.createElement("div", {
      className: "admin-content"
    }, /*#__PURE__*/React.createElement("div", {
      className: "admin-section"
    }, /*#__PURE__*/React.createElement("form", {
      className: "admin-form horizontal-form",
      onSubmit: handleAddUser
    }, /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", {
      htmlFor: "username"
    }, "User Name"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      id: "username",
      name: "username",
      placeholder: "Enter new user's name",
      value: newUsername,
      onChange: e => setNewUsername(e.target.value)
    })), /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", {
      htmlFor: "password"
    }, "Password"), /*#__PURE__*/React.createElement("input", {
      type: "password",
      id: "password",
      name: "password",
      placeholder: "Enter password",
      value: newPassword,
      onChange: e => setNewPassword(e.target.value)
    })), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "admin-button"
    }, "Add User"))), /*#__PURE__*/React.createElement("div", {
      className: "admin-section"
    }, /*#__PURE__*/React.createElement("form", {
      className: "admin-form horizontal-form",
      onSubmit: handleDeleteUser
    }, /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", {
      htmlFor: "delete-username"
    }, "User Name"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      id: "delete-username",
      name: "delete-username",
      placeholder: "Enter user's name to delete",
      value: deleteUsername,
      onChange: e => setDeleteUsername(e.target.value)
    })), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "admin-button danger"
    }, "Delete User"))), /*#__PURE__*/React.createElement("div", {
      className: "admin-section"
    }, /*#__PURE__*/React.createElement("h2", null, "User List"), /*#__PURE__*/React.createElement("table", {
      className: "users-table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "User Name"), /*#__PURE__*/React.createElement("th", null, "Role"))), /*#__PURE__*/React.createElement("tbody", null, users.length > 0 ? users.map(user => /*#__PURE__*/React.createElement("tr", {
      key: user.id
    }, /*#__PURE__*/React.createElement("td", null, user.username), /*#__PURE__*/React.createElement("td", null, user.role))) : /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      colSpan: "2",
      style: {
        textAlign: 'center',
        fontStyle: 'italic',
        color: 'rgba(255, 255, 255, 0.5)'
      }
    }, "No users found.")))))));
  };
  _s(AdminPanel, "aN4+h7fB7VQi1faFsiFgTfpQ1ZI=");
  _c = AdminPanel;
  var _c;
  $RefreshReg$(_c, "AdminPanel");
}.call(this, module);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"App.jsx":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// imports/ui/App.jsx                                                                                         //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
!function (module1) {
  module1.export({
    App: () => App
  });
  let React, useState;
  module1.link("react", {
    default(v) {
      React = v;
    },
    useState(v) {
      useState = v;
    }
  }, 0);
  let Header;
  module1.link("./Header.jsx", {
    Header(v) {
      Header = v;
    }
  }, 1);
  let Footer;
  module1.link("./Footer.jsx", {
    Footer(v) {
      Footer = v;
    }
  }, 2);
  let Sidebar;
  module1.link("./Sidebar.jsx", {
    Sidebar(v) {
      Sidebar = v;
    }
  }, 3);
  let MainContent;
  module1.link("./MainContent.jsx", {
    MainContent(v) {
      MainContent = v;
    }
  }, 4);
  let ContactInfo;
  module1.link("./ContactInfo.jsx", {
    ContactInfo(v) {
      ContactInfo = v;
    }
  }, 5);
  let AdminPanel;
  module1.link("./AdminPanel.jsx", {
    AdminPanel(v) {
      AdminPanel = v;
    }
  }, 6);
  ___INIT_METEOR_FAST_REFRESH(module);
  var _s = $RefreshSig$();
  const App = () => {
    _s();
    const [content, setContent] = useState('main');
    const handleHomeClick = () => {
      setContent('main');
    };
    const handleContactClick = () => {
      setContent('contact');
    };
    const handleAdminClick = () => {
      setContent('admin');
    };
    let currentContent;
    if (content === 'contact') {
      currentContent = /*#__PURE__*/React.createElement(ContactInfo, null);
    } else if (content === 'admin') {
      currentContent = /*#__PURE__*/React.createElement(AdminPanel, null);
    } else {
      currentContent = /*#__PURE__*/React.createElement(MainContent, null);
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "app-container"
    }, /*#__PURE__*/React.createElement(Header, {
      onHomeClick: handleHomeClick,
      onContactClick: handleContactClick
    }), /*#__PURE__*/React.createElement("div", {
      className: "main-container"
    }, /*#__PURE__*/React.createElement(Sidebar, {
      onAdminClick: handleAdminClick
    }), currentContent), /*#__PURE__*/React.createElement(Footer, null));
  };
  _s(App, "4FdrWYZJJKypixwkIFftZjQaQao=");
  _c = App;
  var _c;
  $RefreshReg$(_c, "App");
}.call(this, module);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ContactInfo.jsx":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// imports/ui/ContactInfo.jsx                                                                                 //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
!function (module1) {
  module1.export({
    ContactInfo: () => ContactInfo
  });
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }
  }, 0);
  ___INIT_METEOR_FAST_REFRESH(module);
  const ContactInfo = () => /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h2", null, "Contact Us"), /*#__PURE__*/React.createElement("p", null, "You can reach us at ", /*#__PURE__*/React.createElement("a", {
    href: "mailto:test@example.com"
  }, "test@example.com")));
  _c = ContactInfo;
  var _c;
  $RefreshReg$(_c, "ContactInfo");
}.call(this, module);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Footer.jsx":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// imports/ui/Footer.jsx                                                                                      //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
!function (module1) {
  module1.export({
    Footer: () => Footer
  });
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }
  }, 0);
  ___INIT_METEOR_FAST_REFRESH(module);
  const Footer = () => /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("p", null, "\xA9 2025 My Meteor App"));
  _c = Footer;
  var _c;
  $RefreshReg$(_c, "Footer");
}.call(this, module);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Header.jsx":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// imports/ui/Header.jsx                                                                                      //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
!function (module1) {
  module1.export({
    Header: () => Header
  });
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }
  }, 0);
  ___INIT_METEOR_FAST_REFRESH(module);
  const Header = _ref => {
    let {
      onHomeClick,
      onContactClick
    } = _ref;
    return /*#__PURE__*/React.createElement("header", {
      className: "header"
    }, /*#__PURE__*/React.createElement("div", {
      className: "logo"
    }, "Logo"), /*#__PURE__*/React.createElement("nav", null, /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "sidebar-button",
      onClick: e => {
        e.preventDefault();
        onHomeClick();
      }
    }, "Home"), /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "sidebar-button"
    }, "About"), /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "sidebar-button",
      onClick: e => {
        e.preventDefault();
        onContactClick();
      }
    }, "Contact")), /*#__PURE__*/React.createElement("div", {
      className: "user-profile"
    }, /*#__PURE__*/React.createElement("input", {
      type: "search",
      placeholder: "Search..."
    }), /*#__PURE__*/React.createElement("span", null, "\uD83D\uDC64")));
  };
  _c = Header;
  var _c;
  $RefreshReg$(_c, "Header");
}.call(this, module);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"MainContent.jsx":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// imports/ui/MainContent.jsx                                                                                 //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
!function (module1) {
  module1.export({
    MainContent: () => MainContent
  });
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }
  }, 0);
  ___INIT_METEOR_FAST_REFRESH(module);
  const MainContent = () => /*#__PURE__*/React.createElement("main", {
    className: "main-content"
  }, /*#__PURE__*/React.createElement("article", null, /*#__PURE__*/React.createElement("h1", {
    className: "welcome-title"
  }, "Welcome to the Pool"), /*#__PURE__*/React.createElement("p", {
    className: "welcome-subtitle"
  }, "Where Luck and Strategy Meets!"), /*#__PURE__*/React.createElement("p", {
    className: "welcome-tagline"
  }, "-- 99% Dump Luck and 1% Strategy --")));
  _c = MainContent;
  var _c;
  $RefreshReg$(_c, "MainContent");
}.call(this, module);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Sidebar.jsx":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// imports/ui/Sidebar.jsx                                                                                     //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
!function (module1) {
  module1.export({
    Sidebar: () => Sidebar
  });
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }
  }, 0);
  ___INIT_METEOR_FAST_REFRESH(module);
  const Sidebar = _ref => {
    let {
      onAdminClick
    } = _ref;
    return /*#__PURE__*/React.createElement("aside", {
      className: "sidebar"
    }, /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "sidebar-button",
      onClick: e => {
        e.preventDefault();
        onAdminClick();
      }
    }, "Admin")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "sidebar-button"
    }, "About")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "sidebar-button"
    }, "Services")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "sidebar-button"
    }, "Contact"))));
  };
  _c = Sidebar;
  var _c;
  $RefreshReg$(_c, "Sidebar");
}.call(this, module);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"client":{"main.jsx":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// client/main.jsx                                                                                            //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }
  }, 0);
  let createRoot;
  module1.link("react-dom/client", {
    createRoot(v) {
      createRoot = v;
    }
  }, 1);
  let Meteor;
  module1.link("meteor/meteor", {
    Meteor(v) {
      Meteor = v;
    }
  }, 2);
  let App;
  module1.link("/imports/ui/App", {
    App(v) {
      App = v;
    }
  }, 3);
  ___INIT_METEOR_FAST_REFRESH(module);
  Meteor.startup(() => {
    const container = document.getElementById('react-target');
    const root = createRoot(container);
    root.render(/*#__PURE__*/React.createElement(App, null));
  });
}.call(this, module);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json",
    ".html",
    ".ts",
    ".jsx",
    ".css"
  ]
});

require("/client/main.jsx");