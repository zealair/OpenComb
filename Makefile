
test:
	./node_modules/.bin/mocha \
		--reporter list \
		--timeout 1000 \
		test/core/*.js

.PHONY: test