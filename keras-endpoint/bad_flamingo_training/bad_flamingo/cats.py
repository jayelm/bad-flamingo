
import json

labels = []
for line in open('categories.txt'):
  labels.append(line.strip())

print(json.dumps(labels))
