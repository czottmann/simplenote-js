.PHONY: docs jslint jslint_tests update_version

DOCS_FOLDER=./docs
TESTS_FOLDER=./tests
YUIDOC_ROOT=../yuidoc
YUIDOC_TMP=./docs/tmp
JS_SRC=./src
VERSION=`cat ./VERSION`


docs:
	@$(YUIDOC_ROOT)/bin/yuidoc.py $(JS_SRC) -p $(YUIDOC_TMP)_parser \
	  -o $(DOCS_FOLDER) -t $(YUIDOC_ROOT)/template -v "`cat ./VERSION`" \
	  -m "JS SimpleNote API wrapper" -u "http://github.com/carlo/simplenote-js" \
	  -C "Carlo Zottmann, carlo@zottmann.org." -s
	@rm -rf $(YUIDOC_TMP) $(YUIDOC_TMP)_parser


jslint:
	@for F in $(JS_SRC)/*.js; do \
	  echo "----- $$F\n"; \
	  java -jar ~/bin/js.jar ~/bin/jslint.js $$F | grep -v "jslint: No problems"; \
	done


jslint_tests:
	@for F in $(TESTS_FOLDER)/*.js; do \
	  echo "----- $$F\n"; \
	  java -jar ~/bin/js.jar ~/bin/jslint.js $$F | grep -v "jslint: No problems"; \
	done


update_version:
	sed "s/ _version = \".*\",/ _VERSION = \"${VERSION}\",/" src/simplenote.js > "src/simplenote.js.${VERSION}" \
	  && mv src/simplenote.js.${VERSION} src/simplenote.js \
	  && git commit -m "Version update: ${VERSION}." src/simplenote.js

