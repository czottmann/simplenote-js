.PHONY: docs

DOCS_FOLDER=./docs
TESTS_FOLDER=./tests
YUIDOC_ROOT=../yuidoc
YUIDOC_TMP=./docs/tmp
JS_SRC=./src
VERSION=`cat ./VERSION`


docs:
	$(YUIDOC_ROOT)/bin/yuidoc.py $(JS_SRC) -p $(YUIDOC_TMP)_parser \
	  -o $(DOCS_FOLDER) -t ../yuidoc-theme-dana -v "`cat ./VERSION`" \
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
	sed "s/ _version = \".*\",/ _version = \"${VERSION}\",/" src/simplenote.js > "src/simplenote.js.${VERSION}" \
	  && mv src/simplenote.js.${VERSION} src/simplenote.js \
	  && git commit -m "Version update: ${VERSION}." src/simplenote.js


production_docs:
	@echo "Switching to gh-pages branch...\n"
	@git checkout gh-pages
	@echo "Merging production branch...\n"
	@git merge production
	@if [[ "`git branch | grep '*' | sed 's/^\* //'`" == "gh-pages" ]]; then \
	  echo "Unstaging and removing unwanted paths from the index...\n"; \
	  git rm -r --cached --ignore-unmatch tests docs; \
	  find . -type f -depth 1 -not \( -name "*.js" -or -name "Makefile" \) -exec git rm --ignore-unmatch --cached "{}" \; ; \
	  echo "Generating docs...\n"; \
	  make docs; \
	  git rm -r --cached --ignore-unmatch src; \
	  echo "Documentation generated.\n"; \
	  echo "Committing changes...\n"; \
	  git add --ignore-errors docs index.html; \
	  git commit -m "New docs generated for version `cat VERSION`." -a; \
	  echo "DONE!\n"; \
	fi
