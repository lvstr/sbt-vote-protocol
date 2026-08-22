.PHONY: build test fmt clean deploy

default: build

build:
	stellar contract build
	@echo ""
	@echo "Build Summary:"
	@ls -la target/wasm32v1-none/release/sbt_vote.wasm

test:
	cargo test -p sbt-vote

fmt:
	cargo fmt --all

clean:
	cargo clean

deploy:
	./scripts/deploy.sh
