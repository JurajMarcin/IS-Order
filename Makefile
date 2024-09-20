SOURCE_DIR = src
SOURCES = $(wildcard $(SOURCE_DIR)/*)
NAME = is-order
VERSION = $(shell jq --raw-output ".version" src/manifest.json)
ARTIFACTS_DIR = dist

.PHONY: all
all: firefox chromium

.PHONY: common-zip
common-zip: $(ARTIFACTS_DIR)/$(NAME)-$(VERSION).zip

.PHONY: firefox
firefox: $(ARTIFACTS_DIR)/$(NAME)-$(VERSION).xpi

.PHONY: chromium
chromium: $(ARTIFACTS_DIR)/$(NAME)-$(VERSION).crx

$(ARTIFACTS_DIR)/$(NAME)-$(VERSION).zip: $(SOURCES)
	yarn build --source-dir=$(SOURCE_DIR) --artifacts-dir=$(ARTIFACTS_DIR) --overwrite-dest --filename=$(NAME)-$(VERSION).zip

$(ARTIFACTS_DIR)/$(NAME)-$(VERSION).xpi: $(SOURCES)
	yarn sign --source-dir=$(SOURCE_DIR) --artifacts-dir=$(ARTIFACTS_DIR)
	mv $(ARTIFACTS_DIR)/*.xpi $@

$(ARTIFACTS_DIR)/$(NAME)-$(VERSION).crx: $(SOURCES)
	mkdir -p $(ARTIFACTS_DIR)/$(NAME)/
	cp $^ $(ARTIFACTS_DIR)/$(NAME)/
	chromium-browser --pack-extension=$(ARTIFACTS_DIR)/$(NAME) --pack-extension-key=$(NAME).pem
	mv $(ARTIFACTS_DIR)/$(NAME).crx $@
