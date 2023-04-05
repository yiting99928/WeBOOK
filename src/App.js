import React from 'react';
import { createGlobalStyle } from 'styled-components';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Create from './pages/Create/Create';
import Profile from './pages/Profile/Profile';
import Process from './pages/Process/Process';
import Home from './pages/Home/Home';
import Ongoing from './pages/Profile/Ongoing';
import Finished from './pages/Profile/Finished';
import Preparing from './pages/Profile/Preparing';
import Live from './pages/Live/Live';

function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/ongoing" element={<Ongoing />} />
        <Route path="/profile/preparing" element={<Preparing />} />
        <Route path="/profile/finished" element={<Finished />} />

        <Route path="/study-group/:id/process" element={<Process />} />
        <Route path="/study-group/:id/live" element={<Live />} />
      </Routes>
    </BrowserRouter>
  );
}
const GlobalStyle = createGlobalStyle`
* {
    box-sizing: border-box;
    font-family: 'Poppins', sans-serif
}
html,
body,
div,
span,
applet,
object,
iframe,
blockquote,
pre,
a,
abbr,
acronym,
address,
big,
cite,
code,
del,
dfn,
em,
img,
ins,
kbd,
q,
s,
samp,
small,
strike,
strong,
sub,
sup,
tt,
var,
center,
dl,
dt,
dd,
ol,
ul,
li,
fieldset,
form,
label,
legend,
table,
caption,
tbody,
tfoot,
thead,
tr,
th,
td,
article,
aside,
canvas,
details,
embed,
figure,
figcaption,
footer,
header,
hgroup,
menu,
nav,
output,
ruby,
section,
summary,
time,
mark,
audio,
video {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
}

/* HTML5 display-role reset for older browsers */
article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
menu,
nav,
section {
    display: block;
}

body {
    line-height: 1;
}

ol,
ul {
    list-style: none;
}

blockquote,
q {
    quotes: none;
}

blockquote:before,
blockquote:after,
q:before,
q:after {
    content: '';
    content: none;
}

table {
    border-collapse: collapse;
    border-spacing: 0;
}

i {
    font-style: italic;
}

b {
    font-weight: bold;
}
*,
*::after,
*::before {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-transition: all 0.2s;
    transition: all 0.2s;
}

img {
    display: block;
}

a:link {
    text-decoration: none;
    color: black;
}

a:visited {
    text-decoration: none;
    color: black;
}

input[type=text]:focus {
    outline: none;
}

input {
    outline: none;
    ${'' /* border: none; */}
}
`;

export default App;
