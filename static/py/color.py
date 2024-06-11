import numpy as np
from decimal import Decimal, ROUND_HALF_UP


def get_power(value):
    if value is None or not np.isfinite(value):
        return 0

    if isinstance(value, (list, np.ndarray)):
        return [get_power(v) for v in value]

    value = abs(value)

    if value >= 1:
        return len(str(int(value))) - 1
    elif value == 0:
        return 0
    else:
        dec = str(value).replace('0.', '', 1)
        ndec = len(dec)
        nnum = len(str(int(dec)))
        return -(ndec - nnum + 1)

    
def get_nearest(x, X):
    return X[np.argmin(np.abs(x - X))]


def round_pimp(bin, center=None):
    step = round(np.min(np.diff(bin)), -get_power(np.min(np.diff(bin))))
    Step = step * np.arange(0, round(10 ** (max(map(get_power, bin)) + 1)))

    if center is None:
        center = 0

    Step = np.concatenate([center - Step[:0:-1], center + Step])
    Step = np.array([get_nearest(b, Step) for b in bin])
    dStep = np.round(np.diff(Step), 10)

    i = 1
    while np.any(np.diff(Step) == 0) or np.any(dStep != dStep[0]):
        step = round(np.min(np.diff(bin)),
                     -get_power(np.min(np.diff(bin))) + i)
        Step = step * np.arange(0,
                                round(10 ** (max(map(get_power, bin)) +
                                             (i+1))))

        if center is None:
            center = 0

        Step = np.concatenate([center - Step[:0:-1], center + Step])
        Step = np.array([get_nearest(b, Step) for b in bin])
        dStep = np.round(np.diff(Step), 10)
        i += 1

        if i == 4:
            break

    return Step


def compute_colorBin(min_val, max_val, colorStep, center=None, include=False, round_vals=True):
    if center is not None:
        maxAbs = max(abs(max_val - center), abs(min_val - center))
        minValue = -maxAbs + center
        maxValue = maxAbs + center
    else:
        minValue = min_val
        maxValue = max_val

    if include:
        nBin = colorStep + 1
    else:
        nBin = colorStep - 1

    bin = np.linspace(minValue, maxValue, nBin)
    
    if round_vals:
        bin = round_pimp(bin, center=center)

    if isinstance(include, bool):
        if not include:
            upBin = np.append(bin, np.inf)
            lowBin = np.append(-np.inf, bin)
            bin = np.append(np.append(-np.inf, bin), np.inf)
        else:
            upBin = bin[1:]
            lowBin = bin[:-1]
    elif len(include) == 2:
        if not include[0] and not include[1]:
            upBin = np.append(bin, np.inf)
            lowBin = np.append(-np.inf, bin)
            bin = np.append(np.append(-np.inf, bin), np.inf)
        elif include[0] and not include[1]:
            upBin = np.append(bin[1:], np.inf)
            lowBin = bin
            bin = np.append(bin, np.inf)
        elif not include[0] and include[1]:
            upBin = bin
            lowBin = np.append(-np.inf, bin[:-1])
            bin = np.append(np.append(-np.inf, bin), np.inf)
        else:
            upBin = bin[1:]
            lowBin = bin[:-1]

    return {'bin': bin, 'upBin': upBin, 'lowBin': lowBin}


def get_color(value, upBin, lowBin, Palette, include_min=False,
              include_max=True, return_id=False):
    if isinstance(include_min, list) or isinstance(include_max, list):
        if len(include_min) != len(Palette):
            include_min = np.resize(include_min, len(Palette)).tolist()
        if len(include_max) != len(Palette):
            include_max = np.resize(include_max, len(Palette)).tolist()

        id_list = [
            get_color(
                value=value,
                upBin=upBin,
                lowBin=lowBin,
                Palette=Palette,
                include_min=im,
                include_max=ix,
                return_id=True
            ) for im, ix in zip(include_min, include_max)
        ]
        id_list = [i for i in id_list if i is not None]
        if id_list:
            id = id_list[0]
        else:
            id = None
    else:
        if not include_min and include_max:
            id = np.where((lowBin < value) & (value <= upBin))[0]
        elif include_min and not include_max:
            id = np.where((lowBin <= value) & (value < upBin))[0]
        elif not include_min and not include_max:
            id = np.where((lowBin < value) & (value < upBin))[0]
        elif include_min and include_max:
            id = np.where((lowBin <= value) & (value <= upBin))[0]

    if return_id:
        if len(id) == 0:
            id = None
        return id
    else:
        if len(id) == 0:
            color = None
        else:
            color = Palette[id[0]]
        return color


def get_colors(Value, upBin, lowBin, Palette,
               include_min=False, include_max=True):
    colors = [
        get_color(value, upBin, lowBin, Palette,
                  include_min, include_max)
        for value in Value
    ]
    return colors


def switch_color(color, color_to_find, color_to_switch):
    #switch 12% https://mdigi.tools/darken-color/#f6e8c3
    color = color.upper()
    color_to_find = np.char.upper(color_to_find)
    color_to_switch = np.char.upper(color_to_switch)
    if color in color_to_find:
        color = color_to_switch[color_to_find == color][0]
    return color
