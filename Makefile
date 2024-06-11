db:
	sudo mount /dev/sde1 /home/louis/.postgresql
	sudo systemctl restart postgresql

front:
	python3 -m http.server
back:
	python3 app.py
