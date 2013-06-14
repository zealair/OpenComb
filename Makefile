
test:
	./node_modules/.bin/mocha \
		--reporter list \
		--timeout 1000 \
		test/core/*.js \
		test/mvc/*.js

.PHONY: test