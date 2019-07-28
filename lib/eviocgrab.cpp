#include <errno.h>
#include <sys/ioctl.h>
#include <linux/input.h>
#include "nan.h"

using namespace v8;
using namespace node;

NAN_METHOD(Eviocgrab) {
    Nan::HandleScope scope;

    Local<Object> buf;
    int length = info.Length();

    assert(length == 2);

    if (!info[0]->IsUint32()) {
        Nan::ThrowTypeError("Argument 0 Must be an Integer");
    }

    if (!info[1]->IsUint32()) {
        Nan::ThrowTypeError("Argument 1 Must be an Integer");
    }

    int fd = Nan::To<int32_t>(info[0]).ToChecked();
    int grab = Nan::To<int32_t>(info[1]).ToChecked();

    int res = ioctl(fd, EVIOCGRAB, grab);
    if (res < 0) {
        return Nan::ThrowError(Nan::ErrnoException(errno, "ioctl", nullptr, nullptr));
    }

    info.GetReturnValue().Set(res);
}

void InitAll(Local<Object> exports) {
    Nan::Set(exports,
             Nan::New("eviocgrab").ToLocalChecked(),
             Nan::GetFunction(Nan::New<FunctionTemplate>(Eviocgrab)).ToLocalChecked());
}

NODE_MODULE(eviocgrab, InitAll)
