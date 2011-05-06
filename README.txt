Cloud Tasks
-----------

This software is protected by the GPL version 2. See file
licence.txt for details of the licence.

If you would like to work on this application then you'll probably need
to know the following to get it, and the associated tests, working...

Running the tests
-----------------

There are automated tests to check all the non-UI code. You can
run the tests by firing up Chrome and pointing it to the file
tests/all-tests.html.

I use Chrome because it has the HTML5 SQL database
installed and enabled. However any other browser that supports
this should also work.

all-tests.html relies on the YUI test framework which is called in
dynamically each time the tests are run, so you will need a network
connection each time you run them.

all-tests.html also relies on the Prototype library being loaded.
This is a hardcoded reference to the Palm SDK's own Prototype library,
to ensure it's running against the right version. You should
change the reference in all-tests.html to point to your own SDK's
prototype.js.

Because lots of Javascript uses callbacks (e.g. the result of executing
some SQL) lots of the tests rely on one thing completing within a certain
timeframe before the next thing running. This means the automated tests
are riddled with race conditions. In reality I have found this is fine
because ample time has (usually) been given. However I have found that the
very first time I run the tests after firing up Safari some of them
fail, but then they run fine a second time. It's as if the database
hasn't warmed up yet. Therefore if the tests fail once just try them
again.

Running the application
-----------------------

There is one file missing from this package if you want to actually run
it on your own webOS device. It's app/lib/Secrets.js and you should
add it yourself to include your own Remember The Milk API key and
shared secret. Write it like this:

Secrets = {
	API_KEY: '___YOUR_API_KEY_HERE___',
	SHARED_SECRET: '__YOUR_SHARED_SECRET_HERE__'
}

To package the application you'll want to exclude the tests and the
various scratch files from the distribution. So use something like this:

palm-package --exclude=tests --exclude=scratch "Cloud-Tasks"

To install it on the emulator, use something like this:

palm-install --device=tcp org.pigsaw.cloudtasks_1.0.5_all.ipk

To tail the log file:

palm-log --device=tcp -f org.pigsaw.cloudtasks

