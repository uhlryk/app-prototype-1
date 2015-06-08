run:
	@DEBUG=server node app.js

test:
	@DEBUG=server NODE_ENV=development ./node_modules/.bin/mocha --check-leaks --timeout 7000 mocha/tests \

testbuild:
	@DEBUG=server NODE_ENV=development ./node_modules/.bin/mocha --check-leaks --timeout 50000 mocha/builder \

#wywołuje pojedyńczy test
#make testone file=<nazwapliku bez .js>
testone:
	@DEBUG=server NODE_ENV=development ./node_modules/.bin/mocha --check-leaks --timeout 7000 --grep $(file) mocha/tests \

cover:
	./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha tests --print both --recursive
#	jakbyśmy chcieli raport html do przeglądarki również wczytać
#	@NODE_APP=local_test NODE_ENV=development ./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha tests --print both --recursive -- -u exports -R spec && open coverage/lcov-report/index.html

complex:
	./node_modules/.bin/plato -r -d plato app && open plato/index.html

.PHONY: test
