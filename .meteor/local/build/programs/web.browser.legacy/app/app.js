var require = meteorInstall({"imports":{"ui":{"AdminPanel.jsx":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// imports/ui/AdminPanel.jsx                                                                                  //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
!function (module1) {
  var _toConsumableArray;
  module1.link("@babel/runtime/helpers/toConsumableArray", {
    default: function (v) {
      _toConsumableArray = v;
    }
  }, 0);
  var _slicedToArray;
  module1.link("@babel/runtime/helpers/slicedToArray", {
    default: function (v) {
      _slicedToArray = v;
    }
  }, 1);
  module1.export({
    AdminPanel: function () {
      return AdminPanel;
    }
  });
  var React, useState;
  module1.link("react", {
    "default": function (v) {
      React = v;
    },
    useState: function (v) {
      useState = v;
    }
  }, 0);
  ___INIT_METEOR_FAST_REFRESH(module);
  var _s = $RefreshSig$();
  var AdminPanel = function () {
    _s();
    var _useState = useState([]),
      _useState2 = _slicedToArray(_useState, 2),
      users = _useState2[0],
      setUsers = _useState2[1];
    var _useState3 = useState(''),
      _useState4 = _slicedToArray(_useState3, 2),
      newUsername = _useState4[0],
      setNewUsername = _useState4[1];
    var _useState5 = useState(''),
      _useState6 = _slicedToArray(_useState5, 2),
      newPassword = _useState6[0],
      setNewPassword = _useState6[1];
    var _useState7 = useState(''),
      _useState8 = _slicedToArray(_useState7, 2),
      deleteUsername = _useState8[0],
      setDeleteUsername = _useState8[1];
    var handleAddUser = function (e) {
      e.preventDefault();
      if (newUsername.trim() === '') {
        alert('Please enter a username.');
        return;
      }
      var newUser = {
        id: Date.now(),
        // simple unique id
        username: newUsername,
        role: 'User'
      };
      setUsers([].concat(_toConsumableArray(users), [newUser]));
      setNewUsername('');
      setNewPassword('');
    };
    var handleDeleteUser = function (e) {
      e.preventDefault();
      if (deleteUsername.trim() === '') {
        alert('Please enter a username to delete.');
        return;
      }
      if (!users.find(function (user) {
        return user.username === deleteUsername;
      })) {
        alert('User not found.');
        return;
      }
      setUsers(users.filter(function (user) {
        return user.username !== deleteUsername;
      }));
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
      onChange: function (e) {
        return setNewUsername(e.target.value);
      }
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
      onChange: function (e) {
        return setNewPassword(e.target.value);
      }
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
      onChange: function (e) {
        return setDeleteUsername(e.target.value);
      }
    })), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "admin-button danger"
    }, "Delete User"))), /*#__PURE__*/React.createElement("div", {
      className: "admin-section"
    }, /*#__PURE__*/React.createElement("h2", null, "User List"), /*#__PURE__*/React.createElement("table", {
      className: "users-table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "User Name"), /*#__PURE__*/React.createElement("th", null, "Role"))), /*#__PURE__*/React.createElement("tbody", null, users.length > 0 ? users.map(function (user) {
      return /*#__PURE__*/React.createElement("tr", {
        key: user.id
      }, /*#__PURE__*/React.createElement("td", null, user.username), /*#__PURE__*/React.createElement("td", null, user.role));
    }) : /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
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
  var _slicedToArray;
  module1.link("@babel/runtime/helpers/slicedToArray", {
    default: function (v) {
      _slicedToArray = v;
    }
  }, 0);
  module1.export({
    App: function () {
      return App;
    }
  });
  var React, useState;
  module1.link("react", {
    "default": function (v) {
      React = v;
    },
    useState: function (v) {
      useState = v;
    }
  }, 0);
  var Header;
  module1.link("./Header.jsx", {
    Header: function (v) {
      Header = v;
    }
  }, 1);
  var Footer;
  module1.link("./Footer.jsx", {
    Footer: function (v) {
      Footer = v;
    }
  }, 2);
  var Sidebar;
  module1.link("./Sidebar.jsx", {
    Sidebar: function (v) {
      Sidebar = v;
    }
  }, 3);
  var MainContent;
  module1.link("./MainContent.jsx", {
    MainContent: function (v) {
      MainContent = v;
    }
  }, 4);
  var ContactInfo;
  module1.link("./ContactInfo.jsx", {
    ContactInfo: function (v) {
      ContactInfo = v;
    }
  }, 5);
  var AdminPanel;
  module1.link("./AdminPanel.jsx", {
    AdminPanel: function (v) {
      AdminPanel = v;
    }
  }, 6);
  ___INIT_METEOR_FAST_REFRESH(module);
  var _s = $RefreshSig$();
  var App = function () {
    _s();
    var _useState = useState('main'),
      _useState2 = _slicedToArray(_useState, 2),
      content = _useState2[0],
      setContent = _useState2[1];
    var handleHomeClick = function () {
      setContent('main');
    };
    var handleContactClick = function () {
      setContent('contact');
    };
    var handleAdminClick = function () {
      setContent('admin');
    };
    var currentContent;
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
    ContactInfo: function () {
      return ContactInfo;
    }
  });
  var React;
  module1.link("react", {
    "default": function (v) {
      React = v;
    }
  }, 0);
  ___INIT_METEOR_FAST_REFRESH(module);
  var ContactInfo = function () {
    return /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h2", null, "Contact Us"), /*#__PURE__*/React.createElement("p", null, "You can reach us at ", /*#__PURE__*/React.createElement("a", {
      href: "mailto:test@example.com"
    }, "test@example.com")));
  };
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
    Footer: function () {
      return Footer;
    }
  });
  var React;
  module1.link("react", {
    "default": function (v) {
      React = v;
    }
  }, 0);
  ___INIT_METEOR_FAST_REFRESH(module);
  var Footer = function () {
    return /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("p", null, "\xA9 2025 My Meteor App"));
  };
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
    Header: function () {
      return Header;
    }
  });
  var React;
  module1.link("react", {
    "default": function (v) {
      React = v;
    }
  }, 0);
  ___INIT_METEOR_FAST_REFRESH(module);
  var Header = function (_ref) {
    var onHomeClick = _ref.onHomeClick,
      onContactClick = _ref.onContactClick;
    return /*#__PURE__*/React.createElement("header", {
      className: "header"
    }, /*#__PURE__*/React.createElement("div", {
      className: "logo"
    }, "Logo"), /*#__PURE__*/React.createElement("nav", null, /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "sidebar-button",
      onClick: function (e) {
        e.preventDefault();
        onHomeClick();
      }
    }, "Home"), /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "sidebar-button"
    }, "About"), /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "sidebar-button",
      onClick: function (e) {
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
    MainContent: function () {
      return MainContent;
    }
  });
  var React;
  module1.link("react", {
    "default": function (v) {
      React = v;
    }
  }, 0);
  ___INIT_METEOR_FAST_REFRESH(module);
  var MainContent = function () {
    return /*#__PURE__*/React.createElement("main", {
      className: "main-content"
    }, /*#__PURE__*/React.createElement("article", null, /*#__PURE__*/React.createElement("h1", {
      className: "welcome-title"
    }, "Welcome to the Pool"), /*#__PURE__*/React.createElement("p", {
      className: "welcome-subtitle"
    }, "Where Luck and Strategy Meets!"), /*#__PURE__*/React.createElement("p", {
      className: "welcome-tagline"
    }, "-- 99% Dump Luck and 1% Strategy --")));
  };
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
    Sidebar: function () {
      return Sidebar;
    }
  });
  var React;
  module1.link("react", {
    "default": function (v) {
      React = v;
    }
  }, 0);
  ___INIT_METEOR_FAST_REFRESH(module);
  var Sidebar = function (_ref) {
    var onAdminClick = _ref.onAdminClick;
    return /*#__PURE__*/React.createElement("aside", {
      className: "sidebar"
    }, /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "sidebar-button",
      onClick: function (e) {
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
  var React;
  module1.link("react", {
    "default": function (v) {
      React = v;
    }
  }, 0);
  var createRoot;
  module1.link("react-dom/client", {
    createRoot: function (v) {
      createRoot = v;
    }
  }, 1);
  var Meteor;
  module1.link("meteor/meteor", {
    Meteor: function (v) {
      Meteor = v;
    }
  }, 2);
  var App;
  module1.link("/imports/ui/App", {
    App: function (v) {
      App = v;
    }
  }, 3);
  ___INIT_METEOR_FAST_REFRESH(module);
  Meteor.startup(function () {
    var container = document.getElementById('react-target');
    var root = createRoot(container);
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