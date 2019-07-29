const http = require('http');

function createObservable(subscribe) {
    return {
        subscribe,
        pipe(operators) {
            return Array.from(arguments).reduce((observable, operator) => {
                return operator(observable)
            }, this);
        }
    };
}

const observable = createObservable((observer) => {
    try {
        const array = [10, 20, 30, 40];

        for (let x of array) {
            observer.next(x);
        }

        observer.complete();
    } catch (err) {
        observer.error(err);
    }
});

function httpGet$(host, path = '/') {
    return createObservable((observer) => {
        try {
            http.get({
                    host: host,
                    path: path
                },
                (response) => {
                    observer.next(response);
                }
            );
        } catch (err) {
            observer.error(err);
        }
    });
}

function ogMap(f) {
    return inputObservable => {
        const outputObservable = createObservable((outputObserver) => {
            inputObservable.subscribe({
                next(x) {
                    const y = f(x);
                    outputObserver.next(y);
                },
                error(err) {
                    outputObserver.error(err);
                },
                complete() {
                    outputObserver.complete();
                }
            });
        });

        return outputObservable;
    };
}

function ogFilter(f) {
    return inputObservable => {
        const outputObservable = createObservable((outputObserver) => {
            inputObservable.subscribe({
                next(x) {
                    if (f(x)) {
                        outputObserver.next(x);
                    }
                },
                error(err) {
                    outputObserver.error(err);
                },
                complete() {
                    outputObserver.complete();
                }
            });
        });

        return outputObservable;
    };
}

const delayBy = (miliseconds) => {
    return createOperator((x, outputObserver) => {
        setTimeout(() => outputObserver.next(x), miliseconds);
    });
};

const map = (func) => {
    return createOperator((x, outputObserver) => {
        return outputObserver.next(func(x));
    });
};

const filter = (func) => {
    return createOperator((x, outputObserver) => {
        if (func(x)) {
            return outputObserver.next(x);
        }
    });
};

function createOperator(func) {
    return inputObservable => {
        return createObservable((outputObserver) => {
            inputObservable.subscribe({
                next(val) {
                    func(val, outputObserver);
                },
                error(err) {
                    outputObserver.error(err);
                },
                complete() {
                    outputObserver.complete();
                }
            });
        });
    };
}

const observer = {
    next(x) {
        console.log(x);
    },
    error(err) {
        console.log(err);
    },
    complete() {
        console.log('done');
    },
};

// const observable2 = map(x => x * 10)(observable);
// const observable2 = observable
//     .pipe(ogMap(x => x * 10))
//     .pipe(ogFilter(x => x !== 200))
//     .pipe(delayByClone(2000))
//     .pipe(map(x => x - 1))
//     .pipe(filter(x => x > 100));

const observable2 = observable.pipe(
    ogMap(x => x * 10),
    ogFilter(x => x !== 200),
    delayBy(2000),
    map(x => x - 1),
    filter(x => x > 100)
);


// observable.subscribe(observer);
observable2.subscribe(observer);

// observableHttpRequest.pipe(
//     map(resp => resp.headers),
//     map(respHeaders => respHeaders.location),
//     filter(reqLocation => reqLocation.indexOf('google'.toLowerCase()) === -1)
// ).subscribe(observer);

httpGet$('facebook.com').pipe(
    map(resp => resp.headers),
    map(respHeaders => respHeaders.location),
    filter(reqLocation => reqLocation.indexOf('google'.toLowerCase()) === -1),
    delayBy(3000)
).subscribe(observer);

// httpGet$('facebook.com').subscribe(observer);
