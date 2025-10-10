"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/d3-drag";
exports.ids = ["vendor-chunks/d3-drag"];
exports.modules = {

/***/ "(ssr)/./node_modules/d3-drag/src/nodrag.js":
/*!********************************************!*\
  !*** ./node_modules/d3-drag/src/nodrag.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   yesdrag: () => (/* binding */ yesdrag)\n/* harmony export */ });\n/* harmony import */ var d3_selection__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! d3-selection */ \"(ssr)/./node_modules/d3-selection/src/select.js\");\n/* harmony import */ var _noevent_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./noevent.js */ \"(ssr)/./node_modules/d3-drag/src/noevent.js\");\n\n\n\n/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(view) {\n  var root = view.document.documentElement,\n      selection = (0,d3_selection__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(view).on(\"dragstart.drag\", _noevent_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"], true);\n  if (\"onselectstart\" in root) {\n    selection.on(\"selectstart.drag\", _noevent_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"], true);\n  } else {\n    root.__noselect = root.style.MozUserSelect;\n    root.style.MozUserSelect = \"none\";\n  }\n}\n\nfunction yesdrag(view, noclick) {\n  var root = view.document.documentElement,\n      selection = (0,d3_selection__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(view).on(\"dragstart.drag\", null);\n  if (noclick) {\n    selection.on(\"click.drag\", _noevent_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"], true);\n    setTimeout(function() { selection.on(\"click.drag\", null); }, 0);\n  }\n  if (\"onselectstart\" in root) {\n    selection.on(\"selectstart.drag\", null);\n  } else {\n    root.style.MozUserSelect = root.__noselect;\n    delete root.__noselect;\n  }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvZDMtZHJhZy9zcmMvbm9kcmFnLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBb0M7QUFDRDs7QUFFbkMsNkJBQWUsb0NBQVM7QUFDeEI7QUFDQSxrQkFBa0Isd0RBQU0sNEJBQTRCLG1EQUFPO0FBQzNEO0FBQ0EscUNBQXFDLG1EQUFPO0FBQzVDLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0Esa0JBQWtCLHdEQUFNO0FBQ3hCO0FBQ0EsK0JBQStCLG1EQUFPO0FBQ3RDLDRCQUE0QixtQ0FBbUM7QUFDL0Q7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyIvVXNlcnMvbWFzb24vRGVza3RvcC9wZXJzb25hbC9jb2RpbmdzL3J0ZC10cmF2ZWwtY2hlY2svbm9kZV9tb2R1bGVzL2QzLWRyYWcvc3JjL25vZHJhZy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3NlbGVjdH0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IG5vZXZlbnQgZnJvbSBcIi4vbm9ldmVudC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2aWV3KSB7XG4gIHZhciByb290ID0gdmlldy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG4gICAgICBzZWxlY3Rpb24gPSBzZWxlY3Qodmlldykub24oXCJkcmFnc3RhcnQuZHJhZ1wiLCBub2V2ZW50LCB0cnVlKTtcbiAgaWYgKFwib25zZWxlY3RzdGFydFwiIGluIHJvb3QpIHtcbiAgICBzZWxlY3Rpb24ub24oXCJzZWxlY3RzdGFydC5kcmFnXCIsIG5vZXZlbnQsIHRydWUpO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuX19ub3NlbGVjdCA9IHJvb3Quc3R5bGUuTW96VXNlclNlbGVjdDtcbiAgICByb290LnN0eWxlLk1velVzZXJTZWxlY3QgPSBcIm5vbmVcIjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24geWVzZHJhZyh2aWV3LCBub2NsaWNrKSB7XG4gIHZhciByb290ID0gdmlldy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG4gICAgICBzZWxlY3Rpb24gPSBzZWxlY3Qodmlldykub24oXCJkcmFnc3RhcnQuZHJhZ1wiLCBudWxsKTtcbiAgaWYgKG5vY2xpY2spIHtcbiAgICBzZWxlY3Rpb24ub24oXCJjbGljay5kcmFnXCIsIG5vZXZlbnQsIHRydWUpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHNlbGVjdGlvbi5vbihcImNsaWNrLmRyYWdcIiwgbnVsbCk7IH0sIDApO1xuICB9XG4gIGlmIChcIm9uc2VsZWN0c3RhcnRcIiBpbiByb290KSB7XG4gICAgc2VsZWN0aW9uLm9uKFwic2VsZWN0c3RhcnQuZHJhZ1wiLCBudWxsKTtcbiAgfSBlbHNlIHtcbiAgICByb290LnN0eWxlLk1velVzZXJTZWxlY3QgPSByb290Ll9fbm9zZWxlY3Q7XG4gICAgZGVsZXRlIHJvb3QuX19ub3NlbGVjdDtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/d3-drag/src/nodrag.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/d3-drag/src/noevent.js":
/*!*********************************************!*\
  !*** ./node_modules/d3-drag/src/noevent.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   nopropagation: () => (/* binding */ nopropagation)\n/* harmony export */ });\nfunction nopropagation(event) {\n  event.stopImmediatePropagation();\n}\n\n/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(event) {\n  event.preventDefault();\n  event.stopImmediatePropagation();\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvZDMtZHJhZy9zcmMvbm9ldmVudC5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFPO0FBQ1A7QUFDQTs7QUFFQSw2QkFBZSxvQ0FBUztBQUN4QjtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIi9Vc2Vycy9tYXNvbi9EZXNrdG9wL3BlcnNvbmFsL2NvZGluZ3MvcnRkLXRyYXZlbC1jaGVjay9ub2RlX21vZHVsZXMvZDMtZHJhZy9zcmMvbm9ldmVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gbm9wcm9wYWdhdGlvbihldmVudCkge1xuICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG59XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/d3-drag/src/noevent.js\n");

/***/ })

};
;