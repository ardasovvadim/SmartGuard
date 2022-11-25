import os
import sys
import argparse
from smartguard.consumers import face_detecting_consumer, face_verify_consumer


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("-c", "--consummer", type=str, required=True, help="Consumer name")
    args = vars(ap.parse_args())

    consumers = {
        'faceDetecting': face_detecting_consumer.prepare,
        'faceVerifying': face_verify_consumer.prepare,
    }

    consumerPrepare = consumers.get(args['consummer'])

    if consumerPrepare is None:
        print(f'Consumer {args["consummer"]} not found')
        stop()
        return

    consumer = consumerPrepare()
    consumer()


def stop():
    try:
        sys.exit(0)
    except SystemExit:
        os._exit(0)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        stop()
