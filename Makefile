
# all: local
.PHONY: local

# remote:
	# sudo scp -r * louis@nuage.unverredelaitsilvousplait.fr:


local:
	python3 -m http.server
