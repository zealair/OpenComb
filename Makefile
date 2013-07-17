
test:
	./node_modules/.bin/mocha \
		--reporter list \
		--timeout 1000 \
		-u bdd \
		test/BDD/core/*.js

	./node_modules/.bin/mocha \
		--reporter list \
		--timeout 1000 \
		-u tdd \
		test/TDD/mvc/*.js

.PHONY: test