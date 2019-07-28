const observable = {
    subscribe(observer) {
        try {
            const array = [10, 20, 30, 40];

            for (let x of array) {
                observer.next(x);
            }

            observer.complete();
        } catch (err) {
            observer.error(err);
        }
    }
};

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

observable.subscribe(observer);
