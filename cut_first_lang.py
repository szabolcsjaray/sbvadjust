import sys

with open(sys.argv[1], encoding='utf-8') as inf:
    with open(sys.argv[1].replace(".sbv", "")+'_hungarian.sbv', 'wb') as of:
        lines = inf.readlines()
        i = 0
        while(i<len(lines)):
            print(lines[i][:2])
            if (lines[i][:2]!="0:"):
                print("Out of synhron!\n" + lines[i])
                break
            of.write(lines[i].encode('utf8'))
            of.write(lines[i+2].encode('utf8'))
            of.write("\n".encode('utf8'))
            i = i + 4