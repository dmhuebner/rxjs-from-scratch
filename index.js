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

function delayBy(miliseconds) {
    return inputObservable => {
        const outputObservable = createObservable((outputObserver) => {
            inputObservable.subscribe({
                next(x) {
                    setTimeout(() => outputObserver.next(x), miliseconds);
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

const delayByClone = (miliseconds) => {
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
    delayByClone(2000),
    map(x => x - 1),
    filter(x => x > 100)
);


observable.subscribe(observer);
observable2.subscribe(observer);
