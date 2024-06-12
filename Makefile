db:
	sudo mount /dev/sdd1 /home/louis/.postgresql
	sudo systemctl restart postgresql

front:
	python3 -m http.server
back:
	python3 app.py
