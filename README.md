# oracle-electron

This is a demo desktop application connecting to an existing Oracle Database
using the Node.js module Electron tooling and the node-oracledb module.

See the related blog post [Desktop applications with node-oracledb and electron](https://medium.com/@cjones-oracle/desktop-applications-with-node-oracledb-and-electron-b45db49653c7).

Christopher Jones, November 2023

With thanks to the samples:

https://www.electronjs.org/docs/latest/tutorial/ipc#pattern-1-renderer-to-main-one-way

https://www.electronjs.org/docs/latest/tutorial/ipc#pattern-2-renderer-to-main-two-way

and to:

https://github.com/n-riesco/oracledb-electron-builder

## Overview

This demo shows how a desktop application can be built using Electron
https://www.electronjs.org/ and the node-oracledb driver
https://www.npmjs.com/package/oracledb.  The application can be packaged in
various standard formats for installation by 3rd parties.  The demo app itself
displays a window that prompts for database user credentials and then lets you
initate a query against an existing Oracle Database.  A technique for efficient
connection management is shown.

## To run the demo

Clone this repository and then install dependecies with:

    npm install

The app can be run in development mode with:

    npm start

## About the Demo

Starting the app opens up a window.

1. The window has fields for database credentials.

   Enter yours and click 'Create connection pool'.

   The window title bar changes to show the current credentials.  The
   node-oracledb module creates the connection pool in the background.  If your
   credentials are incorrect, you will only get an error when you later try to
   use a connection from the pool.

2. The lower part of the application window has a 'Query the current time'
   button.

   Click this to query the database and display the current time.

   Note the console output showing that a new connection was opened.

Even though there is just one database connection opened, a connection pool is
used. The alternatives to a pool that could have been considered are:

- Using a standalone connection that is opened when the application starts, and
  closed when the application exits.  This would mean that an idle application
  holds onto database resource even if the user is not interacting with the
  application.  If the connection because unusable in the period, perhaps
  because of a firewall timeout, the application might return an error.

- Using a standalone connection that is opened and then closed after each
  database query is executed.  It adds extra load to the database due to the
  costs of creating and tearing down the connection resources.  This can be
  slow and will impact application performance.

The benefits of using a node-oracledb connection pool for the single connection
are:

- The pool keeps a connection open and immediately available when the
  application is in frequent use.

- The pool automatically closes the connection when it has been idle and unused
  for a specified length of time.  This frees up database resources for other
  database applications.

- The pool automatically opens a new connection when the application becomes
  active again.

This means that repeatedly querying the database doesn't have to suffer the
overhead of re-creating a connection; instead the already opened connection is
retrieved from the pool and used.  The application simply calls 'connection
create' and 'connection close' methods and always gets a connection
returned. The pool logic and expiry behavior is not exposed to the rest of the
application.  The pool is configured so that if the connection is idle in the
pool for a specified time (i.e. when the app window is not being used), then
the connection will be closed to free up database resources; then the next time
the current time needs to be displayed a new connection is created.  For this
demo, the pool connection timeout is set to an artificially low 5 seconds.
Console log output shows when a new connection is created.

## Packaging the application for distribution

Electron allows applications to be be packaged up for distribution.  The
`package.json` file has targets for Windows, macOS, and Linux.

### Build a Windows MSI package with:

    npm run packwin

### Build a macOS packge with:

    npm run packmac

The release/mac-universal directory contains `OracleDBExampleApp.app` which can
be run directrly, or the `release/OracleDBExampleApp-1.0.0-universal.dmg`
package can be installed

### Build a Linux RPM package with:

Creating the Linux package needs the rpmbuild program.  On Oracle
Linux 8 this can be installed with:

    sudo dnf install rpm-build

Then the application package can be built:

    npm run packlinux

This creates an RPM like `release/oracledb-electron-demo-1.0.0.x86_64.rpm`

Files in this package can be shown with

    rpm -qlp release/*rpm

Install the package with:

    sudo dnf install -y release/oracledb-electron-demo-1.0.0.x86_64.rpm

Run the application by searching for it in the installed applications, or run
it directly from a terminal window:

    /opt/OracleDBExampleApp/oracledb-electron-demo

When finished, the Linux package can be removed with:

    sudo dnf remove -y oracledb-electron-demo


## About the Implementation

The application window layout is in `index.html`.

The main runtime file in `main.js`.  This opens the application window and
handles communication between the window and backend.

The node-oracledb logic is encapsulated in `src/myoracle.js`
